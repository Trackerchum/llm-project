import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { MCPServer } from "../mcp/MCPServer";
import { randomUUID } from "node:crypto";
import { MCP_SESSION_ID } from "@Shared/constants";
import { logger } from "@Shared/logging";

export class MCPController extends BaseController {
	private transports = new Map<string, StreamableHTTPServerTransport>();

	constructor(baseUrl: string) {
		super(baseUrl);
	}

	createTransportForSession = async (sessionId: string) => {
		const server = new MCPServer({
			name: "MCPServer",
			version: "1.0.0",
			description: "MCPServer",
		});

		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => sessionId,
			enableJsonResponse: true,
			onsessionclosed: (sessionId) => {
				this.transports.delete(sessionId);
			},
		});

		await server.connect(transport);
		return transport;
	};

	setupRoutes = (app: Express) => {
		app.all(this.baseUrl, async (req, res) => {
			const sessionId = req.header(MCP_SESSION_ID);

			let transport = sessionId ? this.transports.get(sessionId) : undefined;
			const isInitializeRequest = req.method === "POST" && req.body?.method === "initialize";

			if (!transport) {
				if (sessionId && !isInitializeRequest) {
					res.status(404).json({
						jsonrpc: "2.0",
						id: null,
						error: {
							code: -32000,
							message: "Session not found",
						},
					});
					return;
				}

				if (!isInitializeRequest) {
					res.status(400).json({
						jsonrpc: "2.0",
						id: null,
						error: {
							code: -32000,
							message: "Bad Request: mcp-session-id header is required",
						},
					});
					return;
				}

				const newSessionId = randomUUID();
				transport = await this.createTransportForSession(newSessionId);
				// Register immediately so the follow-up initialized notification can resolve.
				this.transports.set(newSessionId, transport);
			}

			await logger(`MCP ${req.body?.method ?? "method"}`, () => transport.handleRequest(req, res, req.body));
		});
	};

	closeTransports = () => {
		void Promise.all(Array.from(this.transports.values()).map((transport) => transport.close()));
	}
}
