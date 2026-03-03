import express from "express";
import * as dotenv from "dotenv";
import { RedisClient } from "@Shared/models/redisClient";
import { DependencyInjectedClasses, setupControllers } from "@Shared/controllers";
import { MCPController } from "./controllers";
import { OllamaClient } from "@Shared/models/ollamaClient";
import { MCPServer } from "./mcp/MCPServer";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

const port = parseInt(process.env.API_PORT, 10);

const corsOrigin = process.env.CORS_ORIGIN ?? "*";
app.use(
	cors({
		origin: corsOrigin,
		credentials: true,
		methods: ["GET", "POST", "OPTIONS", "DELETE"],
		allowedHeaders: ["Content-Type", "mcp-session-id"],
		exposedHeaders: ["mcp-session-id"],
	}),
);

async function connectToMCP() {
	const transports = new Map<string, StreamableHTTPServerTransport>();
	const normalizeSessionId = (value: string | undefined): string | undefined => {
		if (!value) {
			return undefined;
		}

		const first = value.split(",")[0]?.trim();
		return first ? first : undefined;
	};
	const createTransportForSession = async (sessionId: string) => {
		const server = new MCPServer({
			name: "MCPServer",
			version: "1.0.0",
			description: "MCPServer",
		});

		const transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => sessionId,
			enableJsonResponse: true,
			onsessionclosed: (sessionId) => {
				transports.delete(sessionId);
			},
		});

		await server.connect(transport);
		return transport;
	};

	app.all("/mcp", async (req, res) => {
		const rawSessionId = req.header("mcp-session-id");
		const sessionId = normalizeSessionId(rawSessionId);

		let transport = sessionId ? transports.get(sessionId) : undefined;
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
			transport = await createTransportForSession(newSessionId);
			// Register immediately so the follow-up initialized notification can resolve.
			transports.set(newSessionId, transport);
		}

		await transport.handleRequest(req, res, req.body);
	});

	const httpServer = app.listen(port, () => {
		console.log(`MCP Server Starter (HTTP) listening on http://localhost:${String(port)}/mcp`);
		console.log(`SSE endpoint: GET http://localhost:${String(port)}/mcp`);
		console.log(`JSON-RPC endpoint: POST http://localhost:${String(port)}/mcp`);
		console.log(`CORS origin: ${corsOrigin}`);
	});

	process.on("SIGINT", () => {
		console.log("Shutting down HTTP server...");
		void Promise.all(Array.from(transports.values()).map((transport) => transport.close()));
		httpServer.close(() => {
			process.exit(0);
		});
	});
}

const redisClient = new RedisClient(
	process.env.REDIS_HOSTNAME,
	parseInt(process.env.REDIS_PORT, 10),
	process.env.REDIS_PASSWORD,
);

const ollamaClient = new OllamaClient();

const diClasses: DependencyInjectedClasses = {
	redisClient,
	ollamaClient,
};

redisClient
	.connect()
	.then(() => {
		// setupControllers(app, [new MCPController("/mcp/")], diClasses);

		connectToMCP()
			.then(() => {})
			.catch((error) => {
				console.error(`Error connecting MCP server: ${error}`);
			});
	})
	.catch((error) => {
		console.error(`Error connecting to redis client: ${error}`);
	});
