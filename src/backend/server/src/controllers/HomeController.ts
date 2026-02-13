import { Express } from 'express';
import { BaseController } from '@Shared/controllers/BaseController';

export class HomeController extends BaseController {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    setupRoutes = (app: Express) => {
        app.get(this.baseUrl, async (req, res) => {
            try {
                const r = await fetch("http://llm-ollama:11434/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "llama3.2:1b",
                        prompt: "How much wood could a woodchuck chuck if a woodchuck could chuck wood?",
                        stream: false
                    }),
                });
            
                if (!r.ok) {
                    const text = await r.text();
                    return res.status(502).json({ error: "ollama_error", status: r.status, body: text });
                }
            
                const data = await r.json();
                return res.json({ ok: true, response: data.response });
            } catch (err: any) {
                console.log("Error on api/generate: ", err);
                return res.status(502).json({
                    ok: false,
                    error: String(err?.message ?? err),
                    cause: {
                        message: String(err?.cause?.message ?? ""),
                        code: err?.cause?.code,
                    },
                });
            }
        });
    }
}
