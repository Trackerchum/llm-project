import path from "path";

export class OllamaClient {
    private endpoint: string;
    private model: string;

    constructor() {
        this.endpoint = "http://llm-ollama:11434";
        this.model = "llama3.2:1b";
    }

    generate = async (prompt: string) => {
        try {
            const response = await fetch(path.join(this.endpoint, "api/generate"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.model,
                    prompt,
                    stream: false
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                return {
                    error: "ollama_error",
                    status: response.status,
                    body: text
                }
            }
        
            return response.json();
        } catch (err: any) {
            return {
                ok: false,
                error: String(err?.message ?? err),
                cause: {
                    message: String(err?.cause?.message ?? ""),
                    code: err?.cause?.code,
                },
            };
        }
    }
}
