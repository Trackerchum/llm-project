import { BaseController } from "@Shared/controllers";
import { logger } from "@Shared/logging";
import { Express } from "express";

export class GenerateController extends BaseController {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	setupRoutes = (app: Express) => {
		app.post(this.baseUrl, async (req, res) => {
			const response = await logger("Ollama generate", () => this.ollamaClient.generate(req.body.prompt));

			if (response.error) {
				return res.status(502).json(response);
			}

			return res.json({ ok: true, response: response.response });
		});
	};
}
