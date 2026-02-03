import { Express } from 'express';
import { BaseController } from '@Shared/controllers/BaseController';

export class HomeController extends BaseController {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    setupRoutes = (app: Express) => {
        app.get(this.baseUrl, (req, res) => {
            res.send('Running...');
        });
    }
}
