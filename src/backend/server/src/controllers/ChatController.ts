import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";
import { MCP_SESSION_ID } from "@Shared/constants";
import { MCPClient } from "@Shared/clients/mcpClient";
import { jsonRpcErrorCodeToHttpStatus } from "@Shared/helpers/mcp";
import { ChatRequest } from "@Shared/models/mcp";
import { logger } from "@Shared/logging";
import { mcpToOllamaTools } from "@Shared/mappers/ollama";


export class ChatController extends BaseController {
	mcpClient: MCPClient;

	constructor(baseUrl: string) {
		super(baseUrl);
		this.mcpClient = new MCPClient(new URL("/mcp", process.env.MCP_BASE_URL).toString());
	}

	setupRoutes = (app: Express) => {
		app.post(this.baseUrl, async (req, res) => {
			if (!req.body?.prompt) {
				return res.status(400).json({
					ok: false,
					error: "Error, chat prompt missing.",
				})
			}
			let mcpSessionId = req.header(MCP_SESSION_ID) ?? null;

			if (!mcpSessionId) {
				const initializeResult = await logger("initialize", () => this.mcpClient.initialize({
					protocolVersion: "2024-11-05",
					capabilities: {},
					clientInfo: {
						name: "server",
						version: "0.1.0",
					},
				}));
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

			const chatRequest = new ChatRequest({
				// TODO fix any
				tools: mcpToOllamaTools((tools.result.tools ?? []) as any[]),
			});

			chatRequest.addMessage({ role: "user", content: req.body.prompt });

			let response = await logger("Ollama chat", () => this.ollamaClient.chat(chatRequest.getChatRequest()));

			if (response.ok === false) {
				return res.status(response.statusCode).json({
					ok: false,
					mcpSessionId,
					error: response.error,
				});
			}

			if (!response.response.message.tool_calls?.length) {
				return res.json({ ok: true, mcpSessionId, response: response.response.message.content });
			}

			const toolCalls = await Promise.all(
				response.response.message.tool_calls.map(async (tool) => {
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

			toolCalls.forEach(call => {
				if (call.ok) {
					chatRequest.addMessage({
						role: "tool",
						// TODO narrowing on call.ok
						content: (call.data as any).result.content[0].text,
						tool_name: call.toolName
					});
				}
			});

			response = await logger("Ollama chat", () => this.ollamaClient.chat(chatRequest.getChatRequest()));

			return res.json({
				ok: true,
				mcpSessionId,
				response: (response as any).response.message.content,
				// for degugging only, don't expose in prod/staging
				chatHistory: chatRequest.getChatRequest()
			});
		});
	};
}