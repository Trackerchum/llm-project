import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";
import { MCP_SESSION_ID } from "@Shared/constants";
import { MCPClient } from "@Shared/clients/mcpClient";
import { jsonRpcErrorCodeToHttpStatus } from "@Shared/helpers/mcp";
import { ChatRequest } from "@Shared/models/mcp";
import { logger } from "@Shared/logging";
import { mcpToOllamaTools } from "@Shared/mappers/ollama";
import { MCPListTool, OllamaChatSuccess } from "@Shared/types/ollama";
import { getUserChatHistories, saveUserChatHistory } from "@Shared/clients/mongoClient/chatHistory";

export class ChatController extends BaseController {
	mcpClient: MCPClient;
	private readonly chatHistoryCollectionName = "chatHistories";

	constructor(baseUrl: string) {
		super(baseUrl);
		this.mcpClient = new MCPClient(new URL("/mcp", process.env.MCP_BASE_URL).toString());
	}

	setupRoutes = (app: Express) => {
		app.get(`${this.baseUrl}/histories/:userId`, async (req, res) => {
			if (!req.params?.userId) {
				return res.status(400).json({
					ok: false,
					error: "Error, user ID missing.",
				});
			}

			try {
				const chatHistories = await getUserChatHistories(
					this.mongoClient,
					this.chatHistoryCollectionName,
					req.params.userId,
				);
				return res.json({ ok: true, userId: req.params.userId, chatHistories });
			} catch (error) {
				return res.status(500).json({
					ok: false,
					error: `Error fetching chat histories: ${error}`,
				});
			}
		});

		app.post(this.baseUrl, async (req, res) => {
			if (!req.body?.prompt || !req.body?.userId) {
				const missingProperties =
					!req.body?.prompt && !req.body?.userId
						? "prompt and userId"
						: !req.body?.prompt
							? "prompt"
							: "userId";
				const errorMessage = `Error, ${missingProperties} missing.`;
				return res.status(400).json({
					ok: false,
					error: errorMessage,
				});
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

			const chatHistories = await getUserChatHistories(
				this.mongoClient,
				this.chatHistoryCollectionName,
				req.body.userId,
			);

			const chatRequest = new ChatRequest({
				tools: mcpToOllamaTools((tools.result.tools ?? []) as MCPListTool[]),
			});

			if (chatHistories.length > 0 && chatHistories[0].messages.length > 0) {
				chatRequest.setId(chatHistories[0].id);
				chatHistories[0].messages.forEach((message) => {
					chatRequest.addMessage({
						role: message.role,
						content: message.content,
					});
				});
			}

			chatRequest.addMessage({ role: "user", content: req.body.prompt });

			let response = await logger("Ollama chat", () => this.ollamaClient.chat(chatRequest.getChatRequest()));

			if (response.ok === false) {
				return res.status(response.statusCode).json({
					ok: false,
					mcpSessionId,
					error: response.error,
				});
			}

			// no tools requested, return message content
			if (!response.response.message.tool_calls?.length) {
				chatRequest.addMessage({
					role: "assistant",
					content: response.response.message.content,
				});
				const chatHistory = chatRequest.getChatRequest();
				await saveUserChatHistory(
					this.mongoClient,
					this.chatHistoryCollectionName,
					req.body.userId,
					chatHistory,
				);
				return res.json({ ok: true, mcpSessionId, response: response.response.message.content });
			}

			let isToolRequested = true;
			let loopNumber = 0;

			// loop while tools are requested
			while (isToolRequested) {
				const toolCalls = await Promise.all(
					(response as OllamaChatSuccess).response.message.tool_calls.map(async (tool) => {
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

				response = await logger("Ollama chat", () => this.ollamaClient.chat(chatRequest.getChatRequest()));

				if (response.ok === false) {
					return res.status(response.statusCode).json({
						ok: false,
						mcpSessionId,
						error: response.error,
					});
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

			const chatHistory = chatRequest.getChatRequest();
			await saveUserChatHistory(this.mongoClient, this.chatHistoryCollectionName, req.body.userId, chatHistory);

			return res.json({
				ok: true,
				mcpSessionId,
				response: (response as any).response.message.content,
				// for degugging only, don't expose in prod/staging
				chatHistory: chatRequest.getChatRequest(),
			});
		});
	};
}
