import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";
import { MCPClient } from "@Shared/clients/mcpClient";
import { logger } from "@Shared/logging";
import { getUserChatHistories, deleteUserChatHistory } from "@Shared/clients/mongoClient/chatHistory";
import { verifyToken } from "@Shared/middleware/verifyToken";

export class ChatHistoryController extends BaseController {
	mcpClient: MCPClient;

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
					getUserChatHistories(this.mongoClient, authenticatedUserId),
				);
				return res.json({ ok: true, userId: authenticatedUserId, chatHistories });
			} catch (error) {
				return res.status(500).json({
					ok: false,
					error: `Error fetching chat histories: ${error}`,
				});
			}
		});

		app.delete(`${this.baseUrl}/:chatId`, verifyToken, async (req, res) => {
			const authenticatedUserId = this.getAuthenticatedUserId(req, res);
			if (!authenticatedUserId || !authenticatedUserId.trim()) {
				return res.status(403).json({
					ok: false,
					error: "Authenticated user id missing from token.",
				});
			}

			const chatId = `${req.params.chatId ?? ""}`.trim();
			if (!chatId) {
				return res.status(400).json({
					ok: false,
					error: "Chat id is required.",
				});
			}

			try {
				await logger("deleteUserChatHistory", () =>
					deleteUserChatHistory(this.mongoClient, authenticatedUserId, chatId),
				);
				return res.json({ ok: true, chatId });
			} catch (error) {
				return res.status(500).json({
					ok: false,
					error: `Error deleting chat history: ${error}`,
				});
			}
		});
	};
}
