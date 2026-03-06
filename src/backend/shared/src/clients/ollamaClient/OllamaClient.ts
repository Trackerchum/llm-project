import { Tool } from "../../types/mcp";
import { Message } from "../../types/mcp/message";
import { OllamaChatSuccess, OllamaError } from "../../types/ollama";

export class OllamaClient {
	private endpoint: string;
	private model: string;
	private stream: boolean;

	constructor() {
		this.endpoint = "http://llm-ollama:11434";
		this.model = "llama3.2:1b";
		this.stream = false;
	}

	generate = async (prompt: string) => {
		try {
			const response = await fetch(new URL("/api/generate", this.endpoint).toString(), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: this.model,
					prompt,
					stream: this.stream,
				}),
			});

			if (!response.ok) {
				const text = await response.text();
				return {
					error: "ollama_error",
					status: response.status,
					body: text,
				};
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
	};

	chat = async (chat: {
		messages: Message[];
		tools?: Tool[];
	}): Promise<OllamaChatSuccess | OllamaError> => {
		try {
			console.log(JSON.stringify({
				model: this.model,
				stream: this.stream,
				...chat
			}));
			const response = await fetch(new URL("/api/chat", this.endpoint).toString(), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: this.model,
					stream: this.stream,
					...chat
				}),
			});
			if (!response.ok) {
				const text = await response.text();
				return {
					ok: false,
					error: "ollama_error",
					statusCode: response.status,
					body: text,
				};
			}

			return response.json();
		} catch (err: any) {
			return {
				ok: false,
				error: String(err?.message ?? err),
				statusCode: err?.cause?.code ?? 500,
				body: String(err?.cause?.message ?? ""),
			};
		}
	}
}
