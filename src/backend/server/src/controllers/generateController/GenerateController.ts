import { BaseController } from "@Shared/controllers";
import { logger } from "@Shared/logging";
import { Express } from "express";

export class GenerateController extends BaseController {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	setupRoutes = (app: Express) => {
		app.get(`${this.baseUrl}/models`, async (_req, res) => {
			const response = await logger("Ollama list models", () => this.ollamaClient.listModels());

			if (response.error) {
				return res.status(response.status ?? 502).json(response);
			}

			return res.json({ ok: true, models: response.models });
		});

		app.post(this.baseUrl, async (req, res) => {
			const prompt = typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
			const model = typeof req.body?.model === "string" ? req.body.model.trim() : "";

			if (!prompt) {
				return res.status(400).json({
					ok: false,
					error: "Error, prompt must be a non-empty string.",
				});
			}

			if (!model) {
				return res.status(400).json({
					ok: false,
					error: "Error, model must be a non-empty string.",
				});
			}

			const response = await logger("Ollama generate", () => this.ollamaClient.generate(prompt, model));

			if (response.error) {
				return res.status(502).json(response);
			}

			return res.json({ ok: true, response: response.response });
		});
	};
}
