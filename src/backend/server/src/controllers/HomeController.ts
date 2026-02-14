import { Express } from 'express';
import { BaseController } from '@Shared/controllers/BaseController';

export class HomeController extends BaseController {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    setupRoutes = (app: Express) => {
        app.get(this.baseUrl, async (req, res) => {
            const response = await this.ollamaClient.generate(
                "How much wood could a woodchuck chuck if a woodchuck could chuck wood?"
            );

            if (response.error) {
                return res.status(502).json(response)
            }
            
            return res.json({ ok: true, response: response });
        });
    }
}
