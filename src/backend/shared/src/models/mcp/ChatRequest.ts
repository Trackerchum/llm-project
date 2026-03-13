import { randomUUID, UUID } from "node:crypto";
import { Message } from "../../types/mcp/message";
import { OllamaTool } from "../../types/ollama";

class ChatRequest {
	private id: UUID;
	name: string;
	private messages: Message[];
	private tools: OllamaTool[];

	constructor(config?: { model?: string; initialInstructions?: Message; tools?: OllamaTool[]; stream?: boolean }) {
		this.id = randomUUID();
		this.name = ""
		this.messages = config?.initialInstructions
			? [config.initialInstructions]
			: [
				{
					role: "system",
					content:
						"You are a chat assistant. Prefer answering directly from general knowledge. " +
						"Call a tool only when the user explicitly needs external or real-time data that the tool provides. " +
						"If no tool is needed, do not call any tools. If you call a tool, never invent the result.",
				},
			];
		this.tools = config?.tools ?? [];
	}

	getId(): UUID {
		return this.id;
	}

	setId(id: UUID) {
		this.id = id;
	}

	setName(name: string) {
		this.name = name
	}

	addMessage(message: Message) {
		this.messages.push(message);
	}

	setTools(tools: OllamaTool[]) {
		this.tools = tools;
	}

	getChatRequest() {
		return {
			id: this.id,
			name: this.name,
			messages: this.messages,
			tools: this.tools,
		};
	}
}

export { ChatRequest };
