import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { MCPController } from "./controllers";
import { setupControllers, getDIClasses, setupGracefulShutdown } from "@Shared/controllers";
import { MCP_SESSION_ID } from "@Shared/constants";

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
		allowedHeaders: ["Content-Type", MCP_SESSION_ID],
		exposedHeaders: [MCP_SESSION_ID],
	}),
);

const diClasses = getDIClasses({
	redis: {
		hostname: process.env.REDIS_HOSTNAME,
		port: parseInt(process.env.REDIS_PORT, 10),
		password: process.env.REDIS_PASSWORD,
	},
	mongo: {
		url: process.env.MONGO_URL,
	},
});

const mcpController = new MCPController("/mcp");

Promise.all([diClasses.redisClient.connect(), diClasses.mongoClient.connect()])
	.then(() => {
		setupControllers(app, [mcpController], diClasses);

		const httpServer = app.listen(port, () => {
			console.log(`listening on port ${port}`);
		});
		setupGracefulShutdown(httpServer, diClasses, {
			message: "Shutting down HTTP server...",
			onBeforeClose: () => {
				mcpController.closeTransports();
			},
		});
	})
	.catch((error) => {
		console.error(`Error connecting to dependency clients: ${error}`);
	});
