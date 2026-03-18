import { randomUUID } from "node:crypto";
import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";
import { MCP_SESSION_ID } from "@Shared/constants";
import { MCPClient } from "@Shared/clients/mcpClient";
import { jsonRpcErrorCodeToHttpStatus } from "@Shared/helpers/mcp";
import { logger } from "@Shared/logging";
import { mcpToOllamaTools } from "@Shared/mappers/ollama";
import { MCPListTool, OllamaChatSuccess, OllamaTool } from "@Shared/types/ollama";
import {
	getUserChatHistoryById,
	saveUserChatHistory,
} from "@Shared/clients/mongoClient/chatHistory";
import { verifyToken } from "@Shared/middleware/verifyToken";
import { validateChatPostBody } from "./validateChatPostBody";
import { ChatRequest } from "../../models/chat";

type ParsedOllamaToolCall = NonNullable<OllamaChatSuccess["response"]["message"]["tool_calls"]>[number];

export class ChatController extends BaseController {
	mcpClient: MCPClient;

	constructor(baseUrl: string) {
		super(baseUrl);
		this.mcpClient = new MCPClient(new URL("/mcp", process.env.MCP_BASE_URL).toString());
	}

	private normaliseToolCallArguments = (argumentsValue: unknown): Record<string, unknown> => {
		if (argumentsValue && typeof argumentsValue === "object" && !Array.isArray(argumentsValue)) {
			return argumentsValue as Record<string, unknown>;
		}

		if (Array.isArray(argumentsValue)) {
			const firstObject = argumentsValue.find(
				(value) => value && typeof value === "object" && !Array.isArray(value),
			);
			if (firstObject) {
				return firstObject as Record<string, unknown>;
			}
		}

		return {};
	};

	private parsePseudoToolCallFromContent = (
		content: string | undefined,
		tools: OllamaTool[],
	): {
		toolCalls: ParsedOllamaToolCall[];
		unknownToolNames: string[];
		isPseudoToolCallPayload: boolean;
	} => {
		if (!content || !content.trim()) {
			return {
				toolCalls: [],
				unknownToolNames: [],
				isPseudoToolCallPayload: false,
			};
		}

		const parsedContent = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
		let payload: unknown;

		try {
			payload = JSON.parse(parsedContent);
		} catch {
			return {
				toolCalls: [],
				unknownToolNames: [],
				isPseudoToolCallPayload: false,
			};
		}

		const pseudoToolCalls = Array.isArray(payload) ? payload : [payload];
		const toolNames = new Set(tools.map((tool) => tool.function.name));
		const unknownToolNames = new Set<string>();
		let isPseudoToolCallPayload = false;

		const parsedCalls = pseudoToolCalls
			.map((entry) => {
				if (!entry || typeof entry !== "object") {
					return null;
				}

				const candidate = entry as {
					name?: unknown;
					functionName?: unknown;
					tool?: unknown;
					parameters?: unknown;
					arguments?: unknown;
					args?: unknown;
				};
				const toolNameCandidate = [candidate.name, candidate.functionName, candidate.tool].find(
					(value) => typeof value === "string" && value.trim().length > 0,
				);
				if (!toolNameCandidate || typeof toolNameCandidate !== "string") {
					return null;
				}

				isPseudoToolCallPayload = true;
				const toolName = toolNameCandidate.trim();
				if (!toolNames.has(toolName)) {
					unknownToolNames.add(toolName);
					return null;
				}

				const argumentsValue = [candidate.arguments, candidate.parameters, candidate.args].find(
					(value) => value !== undefined,
				);

				return {
					id: randomUUID(),
					function: {
						index: 0,
						name: toolName,
						arguments: this.normaliseToolCallArguments(argumentsValue),
					},
				} satisfies ParsedOllamaToolCall;
			});

		return {
			toolCalls: parsedCalls.filter((value) => value !== null) as ParsedOllamaToolCall[],
			unknownToolNames: Array.from(unknownToolNames),
			isPseudoToolCallPayload,
		};
	};

	setupRoutes = (app: Express) => {
		app.post(this.baseUrl, verifyToken, async (req, res) => {
			const validationResult = validateChatPostBody(req.body);
			if (validationResult.ok === false) {
				return res.status(400).json({
					ok: false,
					error: validationResult.error,
				});
			}

			const { prompt, chatId, model } = validationResult.value;
			const authenticatedUserId = this.getAuthenticatedUserId(req, res);
			if (!authenticatedUserId || !authenticatedUserId.trim()) {
				return res.status(403).json({
					ok: false,
					error: "Authenticated user id missing from token.",
				});
			}

			if (model) {
				const availableModelsResponse = await logger("Ollama list models", () => this.ollamaClient.listModels());
				if (availableModelsResponse.error) {
					return res.status(availableModelsResponse.status ?? 502).json({
						ok: false,
						error: availableModelsResponse.error,
					});
				}

				if (!availableModelsResponse.models.includes(model)) {
					return res.status(400).json({
						ok: false,
						error: "Error, selected model is not available.",
						model,
						availableModels: availableModelsResponse.models,
					});
				}
			}

			let mcpSessionId = req.header(MCP_SESSION_ID) ?? null;

			if (!mcpSessionId) {
				const initializeResult = await logger("initialize", () =>
					this.mcpClient.initialize({
						protocolVersion: "2024-11-05",
						capabilities: {},
						clientInfo: {
							name: "server",
							version: "0.1.0",
						},
					}),
				);
				if ("error" in initializeResult.response) {
					return res.status(502).json({
						ok: false,
						error: initializeResult.response.error,
					});
				}

				if (!initializeResult.sessionId) {
					return res.status(502).json({
						ok: false,
						error: "MCP initialize succeeded but no session id was returned.",
					});
				}

				mcpSessionId = initializeResult.sessionId;
				await logger("sendInitialized", () => this.mcpClient.sendInitialized(mcpSessionId));
			}

			// TODO periodically get and cache tools
			const tools = await logger("toolsList", () => this.mcpClient.toolsList(mcpSessionId, {}));
			res.setHeader(MCP_SESSION_ID, mcpSessionId);

			if ("error" in tools) {
				return res.status(jsonRpcErrorCodeToHttpStatus(tools.error.code)).json({
					ok: false,
					mcpSessionId,
					error: tools.error,
				});
			}

			const activeChatHistory = await getUserChatHistoryById(this.mongoClient, authenticatedUserId, chatId);

			const ollamaTools = mcpToOllamaTools((tools.result.tools ?? []) as MCPListTool[]);
			const chatRequest = new ChatRequest(ollamaTools, activeChatHistory);

			let chatNamePromise: Promise<any>;

			if (!activeChatHistory) {
				chatNamePromise = logger("Ollama generate chat name", () =>
					this.ollamaClient.generate(
						`Summarise the content of the question or statement below into a title. The title must be no longer than five words, only return those five words.
					
					"${prompt}"`,
						model,
					),
				);
			}

			chatRequest.addMessage({ role: "user", content: prompt });

			let response = await logger("Ollama chat", () => this.ollamaClient.chat(chatRequest.getChatRequest(), model));

			if (response.ok === false) {
				return res.status(response.statusCode).json({
					ok: false,
					mcpSessionId,
					error: response.error,
				});
			}

			const fallbackToolParse = this.parsePseudoToolCallFromContent(
				response.response.message.content,
				ollamaTools,
			);
			if (!response.response.message.tool_calls?.length && fallbackToolParse.toolCalls.length) {
				await logger("fallbackPseudoToolCallUsed", async () => Promise.resolve(null), {
					fallback_tool_call_count: fallbackToolParse.toolCalls.length,
					fallback_tool_names: fallbackToolParse.toolCalls.map((toolCall) => toolCall.function.name),
				});
				response.response.message.tool_calls = fallbackToolParse.toolCalls;
				// Content contains pseudo tool-call JSON; replace with empty content to prevent echoing it.
				response.response.message.content = "";
			} else if (
				!response.response.message.tool_calls?.length &&
				fallbackToolParse.isPseudoToolCallPayload &&
				fallbackToolParse.unknownToolNames.length
			) {
				await logger("hallucinatedPseudoToolCall", async () => Promise.resolve(null), {
					unknown_tool_count: fallbackToolParse.unknownToolNames.length,
					unknown_tool_names: fallbackToolParse.unknownToolNames,
				});

				chatRequest.addMessage({
					role: "assistant",
					content: response.response.message.content ?? "",
				});
				chatRequest.addMessage({
					role: "user",
					content:
						`Only call available tools. Unavailable requested tool(s): ${fallbackToolParse.unknownToolNames.join(", ")}. ` +
						`Available tools: ${ollamaTools.map((tool) => tool.function.name).join(", ")}. ` +
						"Do not output tool-call JSON as plain text. Use only valid tool calls, or if you already have enough tool output, answer directly.",
				});

				response = await logger("Ollama chat recovery unavailable tool", () =>
					this.ollamaClient.chat(chatRequest.getChatRequest(), model),
				);

				if (response.ok === false) {
					return res.status(response.statusCode).json({
						ok: false,
						mcpSessionId,
						error: response.error,
					});
				}

				const recoveredToolParse = this.parsePseudoToolCallFromContent(
					response.response.message.content,
					ollamaTools,
				);
				if (!response.response.message.tool_calls?.length && recoveredToolParse.toolCalls.length) {
					await logger("fallbackPseudoToolCallUsed", async () => Promise.resolve(null), {
						fallback_tool_call_count: recoveredToolParse.toolCalls.length,
						fallback_tool_names: recoveredToolParse.toolCalls.map((toolCall) => toolCall.function.name),
					});
					response.response.message.tool_calls = recoveredToolParse.toolCalls;
					response.response.message.content = "";
				}
			}

			// no tools requested, return message content
			if (!response.response.message.tool_calls?.length) {
				const chatName = activeChatHistory?.name ?? (await chatNamePromise).response;
				chatRequest.setName(chatName);
				chatRequest.addMessage({
					role: "assistant",
					content: response.response.message.content,
				});
				const chatHistory = chatRequest.getChatRequest();
				await saveUserChatHistory(this.mongoClient, authenticatedUserId, chatHistory);
				return res.json({
					ok: true,
					mcpSessionId,
					response: response.response.message.content,
					chatId: chatRequest.getId(),
					name: chatName,
					// for degugging only, don't expose in prod/staging
					chatHistory: chatRequest.getChatRequest(),
				});
			}

			let isToolRequested = true;
			let loopNumber = 0;

			// loop while tools are requested
			while (isToolRequested) {
				const responseMessage = (response as OllamaChatSuccess).response.message;
				chatRequest.addMessage({
					role: "assistant",
					content: responseMessage.content ?? "",
					tool_calls: responseMessage.tool_calls,
				});

				const toolCalls = await Promise.all(
					responseMessage.tool_calls.map(async (tool) => {
						const toolResponse = await this.mcpClient.callTool(mcpSessionId, {
							name: tool.function.name,
							arguments: tool.function.arguments,
						});

						return {
							// TODO error handling
							ok: true,
							toolName: tool.function.name,
							toolCallId: tool.id,
							data: toolResponse,
						};
					}),
				);

				toolCalls.forEach((call) => {
					if (call.ok) {
						chatRequest.addMessage({
							role: "tool",
							// TODO narrowing on call.ok, error handling
							content: (call.data as any).result.content[0].text,
							tool_name: call.toolName,
						});
					}
				});

				response = await logger("Ollama chat", () => this.ollamaClient.chat(chatRequest.getChatRequest(), model));

				if (response.ok === false) {
					return res.status(response.statusCode).json({
						ok: false,
						mcpSessionId,
						error: response.error,
					});
				}

				const fallbackToolParse = this.parsePseudoToolCallFromContent(
					response.response.message.content,
					ollamaTools,
				);
				if (!response.response.message.tool_calls?.length && fallbackToolParse.toolCalls.length) {
					await logger("fallbackPseudoToolCallUsed", async () => Promise.resolve(null), {
						fallback_tool_call_count: fallbackToolParse.toolCalls.length,
						fallback_tool_names: fallbackToolParse.toolCalls.map((toolCall) => toolCall.function.name),
					});
					response.response.message.tool_calls = fallbackToolParse.toolCalls;
					// Content contains pseudo tool-call JSON; replace with empty content to prevent echoing it.
					response.response.message.content = "";
				} else if (
					!response.response.message.tool_calls?.length &&
					fallbackToolParse.isPseudoToolCallPayload &&
					fallbackToolParse.unknownToolNames.length
				) {
					await logger("hallucinatedPseudoToolCall", async () => Promise.resolve(null), {
						unknown_tool_count: fallbackToolParse.unknownToolNames.length,
						unknown_tool_names: fallbackToolParse.unknownToolNames,
					});

					chatRequest.addMessage({
						role: "assistant",
						content: response.response.message.content ?? "",
					});
					chatRequest.addMessage({
						role: "user",
						content:
							`Only call available tools. Unavailable requested tool(s): ${fallbackToolParse.unknownToolNames.join(", ")}. ` +
							`Available tools: ${ollamaTools.map((tool) => tool.function.name).join(", ")}. ` +
							"Do not output tool-call JSON as plain text. Use only valid tool calls, or if you already have enough tool output, answer directly.",
					});

					response = await logger("Ollama chat recovery unavailable tool", () =>
						this.ollamaClient.chat(chatRequest.getChatRequest(), model),
					);

					if (response.ok === false) {
						return res.status(response.statusCode).json({
							ok: false,
							mcpSessionId,
							error: response.error,
						});
					}

					const recoveredToolParse = this.parsePseudoToolCallFromContent(
						response.response.message.content,
						ollamaTools,
					);
					if (!response.response.message.tool_calls?.length && recoveredToolParse.toolCalls.length) {
						await logger("fallbackPseudoToolCallUsed", async () => Promise.resolve(null), {
							fallback_tool_call_count: recoveredToolParse.toolCalls.length,
							fallback_tool_names: recoveredToolParse.toolCalls.map((toolCall) => toolCall.function.name),
						});
						response.response.message.tool_calls = recoveredToolParse.toolCalls;
						response.response.message.content = "";
					}
				}

				if (!response.response.message.tool_calls?.length) {
					isToolRequested = false;
				}

				loopNumber++;
				if (loopNumber === 5) {
					// TODO find a better approach when there are more tools, currently this is just a simple loop break.
					chatRequest.setTools([]);
					chatRequest.addMessage({
						role: "user",
						content: "Respond with only the information you currently have.",
					});
				}
			}

			chatRequest.addMessage({
				role: "assistant",
				content: (response as any).response.message.content,
			});

			const chatName = activeChatHistory?.name ?? (await chatNamePromise).response;

			chatRequest.setName(chatName);

			const chatHistory = chatRequest.getChatRequest();

			await saveUserChatHistory(this.mongoClient, authenticatedUserId, chatHistory);

			return res.json({
				ok: true,
				mcpSessionId,
				response: (response as any).response.message.content,
				chatId: chatRequest.getId(),
				name: chatName,
				// for degugging only, don't expose in prod/staging
				chatHistory: chatRequest.getChatRequest(),
			});
		});
	};
}
