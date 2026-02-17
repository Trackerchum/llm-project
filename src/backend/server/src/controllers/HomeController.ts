import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";

export class HomeController extends BaseController {
	constructor(baseUrl: string) {
		super(baseUrl);
	}

	setupRoutes = (app: Express) => {
		app.post(this.baseUrl, async (req, res) => {

			return res.json({ ok: true, response: "Hello world" });
		});
	};
}
