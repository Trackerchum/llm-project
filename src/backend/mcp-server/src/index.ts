import express from "express";
import * as dotenv from "dotenv";
import { RedisClient } from "@Shared/models/redisClient";
import cors from "cors";
import { MCPController } from "./controllers";
import { OllamaClient } from "@Shared/models/ollamaClient";
import { setupControllers, getDIClasses } from "@Shared/controllers";

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

const diClasses = getDIClasses({
	redis: {
		hostname: process.env.REDIS_HOSTNAME,
		port: parseInt(process.env.REDIS_PORT, 10), password: process.env.REDIS_PASSWORD
	}
})

const mcpController = new MCPController("/mcp");

diClasses.redisClient
	.connect()
	.then(() => {
		setupControllers(app, [mcpController], diClasses);

		const httpServer = app.listen(port, () => {
			console.log(`MCP Server Starter (HTTP) listening on http://localhost:${String(port)}/mcp`);
			console.log(`SSE endpoint: GET http://localhost:${String(port)}/mcp`);
			console.log(`JSON-RPC endpoint: POST http://localhost:${String(port)}/mcp`);
			console.log(`CORS origin: ${corsOrigin}`);
		});

		process.on("SIGINT", () => {
			console.log("Shutting down HTTP server...");
			mcpController.closeTransports();
			httpServer.close(() => {
				process.exit(0);
			});
		});
	})
	.catch((error) => {
		console.error(`Error connecting to redis client: ${error}`);
	});

