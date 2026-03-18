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
			const response = await logger("Ollama generate", () => this.ollamaClient.generate(req.body.prompt));

			if (response.error) {
				return res.status(502).json(response);
			}

			return res.json({ ok: true, response: response.response });
		});
	};
}
