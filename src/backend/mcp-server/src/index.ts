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
app.use(cors({
	origin: corsOrigin,
	credentials: true,
	methods: ["GET", "POST", "OPTIONS", "DELETE"],
	allowedHeaders: ["Content-Type", "x-mcp-session", "x-mcp-session-id"],
	exposedHeaders: ["x-mcp-session-id"]
}));

async function connectToMCP() {
	const server = new MCPServer({
		name: 'MCPServer',
		version: '1.0.0',
		description: 'MCPServer',
	});

	// Create transport with session support
	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: () => randomUUID()
	});

	await server.connect(transport);

	app.all("/mcp", (req, res) => {
		void transport.handleRequest(req, res, req.body);
	});

	const httpServer = app.listen(port, () => {
		console.log(`MCP Server Starter (HTTP) listening on http://localhost:${String(port)}/mcp`);
		console.log(`SSE endpoint: GET http://localhost:${String(port)}/mcp`);
		console.log(`JSON-RPC endpoint: POST http://localhost:${String(port)}/mcp`);
		console.log(`CORS origin: ${corsOrigin}`);
	});

	process.on("SIGINT", () => {
		console.log("Shutting down HTTP server...");
		void transport.close();
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

		connectToMCP().then(() => {

		}).catch((error) => {
			console.error(`Error connecting MCP server: ${error}`);
		});
	})
	.catch((error) => {
		console.error(`Error connecting to redis client: ${error}`);
	});
