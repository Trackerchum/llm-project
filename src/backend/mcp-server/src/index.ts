import express from "express";
import * as dotenv from "dotenv";
import { RedisClient } from "@Shared/models/redisClient";
import cors from "cors";
import { connectToMCP } from "./connectToMCP";
import { MCPController } from "./controllers";
import { OllamaClient } from "@Shared/models/ollamaClient";
import { DependencyInjectedClasses, setupControllers } from "@Shared/controllers";

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
		setupControllers(app, [new MCPController("/mcp")], diClasses);

		connectToMCP({ app, port, corsOrigin })
			.then(() => { })
			.catch((error) => {
				console.error(`Error connecting MCP server: ${error}`);
			});
	})
	.catch((error) => {
		console.error(`Error connecting to redis client: ${error}`);
	});

