import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";
import { MCP_SESSION_ID } from "@Shared/constants";
import { MCPClient } from "@Shared/clients/mcpClient";
import { jsonRpcErrorCodeToHttpStatus } from "@Shared/helpers/mcp";
import { ChatRequest } from "@Shared/models/mcp";
import { logger } from "@Shared/logging";
import { mcpToOllamaTools } from "@Shared/mappers/ollama";
import { MCPListTool, OllamaChatSuccess } from "@Shared/types/ollama";
import { getUserChatHistories, getUserChatHistoryById, saveUserChatHistory } from "@Shared/clients/mongoClient/chatHistory";
import { verifyToken } from "@Shared/middleware/verifyToken";
import { validateChatPostBody } from "./validateChatPostBody";

export class ChatController extends BaseController {
	mcpClient: MCPClient;
	private readonly chatHistoryCollectionName = "chatHistories";

	constructor(baseUrl: string) {
		super(baseUrl);
		this.mcpClient = new MCPClient(new URL("/mcp", process.env.MCP_BASE_URL).toString());
	}

	setupRoutes = (app: Express) => {
		app.get(`${this.baseUrl}/histories`, verifyToken, async (req, res) => {
			const authenticatedUserId = this.getAuthenticatedUserId(req, res);
			if (!authenticatedUserId || !authenticatedUserId.trim()) {
				return res.status(403).json({
					ok: false,
					error: "Authenticated user id missing from token.",
				});
			}

			try {
				const chatHistories = await logger("getUserChatHistories", () =>
					getUserChatHistories(this.mongoClient, this.chatHistoryCollectionName, authenticatedUserId),
				);
				return res.json({ ok: true, userId: authenticatedUserId, chatHistories });
			} catch (error) {
				return res.status(500).json({
					ok: false,
					error: `Error fetching chat histories: ${error}`,
				});
			}
		});

		app.post(this.baseUrl, async (req, res) => {
			const validationResult = validateChatPostBody(req.body);
			if (validationResult.ok === false) {
				return res.status(400).json({
					ok: false,
					error: validationResult.error,
				});
			}

			const { prompt, userId, chatId } = validationResult.value;
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

			const activeChatHistory = await getUserChatHistoryById(
				this.mongoClient,
				this.chatHistoryCollectionName,
				userId,
				chatId,
			);

			const chatRequest = new ChatRequest(mcpToOllamaTools((tools.result.tools ?? []) as MCPListTool[]));

			let chatNamePromise: Promise<any>;

			if (!activeChatHistory) {
				chatNamePromise = logger("Ollama generate chat name", () =>
					this.ollamaClient.generate(
						`Summarise the content of the question or statement below into a title. The title must be no longer than five words, only return those five words.
					
					"${prompt}"`,
					),
				);
			}

			chatRequest.addMessage({ role: "user", content: prompt });

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
				const chatName = activeChatHistory?.name ?? (await chatNamePromise).response;
				chatRequest.setName(chatName);
				chatRequest.addMessage({
					role: "assistant",
					content: response.response.message.content,
				});
				const chatHistory = chatRequest.getChatRequest();
				await saveUserChatHistory(this.mongoClient, this.chatHistoryCollectionName, userId, chatHistory);
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

			const chatName = activeChatHistory?.name ?? (await chatNamePromise).response;

			chatRequest.setName(chatName);

			const chatHistory = chatRequest.getChatRequest();

			await saveUserChatHistory(this.mongoClient, this.chatHistoryCollectionName, userId, chatHistory);

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
