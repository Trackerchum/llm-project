import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";

export class HomeController extends BaseController {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	setupRoutes = (app: Express) => {
		app.post(this.baseUrl, async (req, res) => {
			const response = await this.ollamaClient.generate(req.body.prompt);

			if (response.error) {
				return res.status(502).json(response);
			}

			return res.json({ ok: true, response: response.response });
		});
	};
}
