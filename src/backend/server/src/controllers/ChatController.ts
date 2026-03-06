import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";
import { MCP_SESSION_ID } from "@Shared/constants";
import { MCPClient } from "@Shared/clients/mcpClient";
import { jsonRpcErrorCodeToHttpStatus } from "@Shared/helpers/mcp";
import { ChatRequest } from "@Shared/models/mcp";
import { logger } from "@Shared/logging";
import { Tool } from "@Shared/types/mcp";

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
				tools: tools.result.tools as Tool[]
			});

			chatRequest.addMessage({ role: "user", content: req.body.prompt });

			const response = await logger("Ollama chat", () => this.ollamaClient.chat(chatRequest.getChatRequest()));

			// call the LLM with the user message + tool definitions - WIP
			// LLM returns plain text so DONE. or...
			// LLM returns call tool getDateTime with args { date: '2026-03-04' }"
			// call tools/call with tool name and params
			// append tool result to convo, ask LLM for final result.
			// return response, inc tools called and reply

			return res.json({ ok: true, response: response });
		});
	};
}