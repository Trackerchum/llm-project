import { randomUUID, UUID } from "node:crypto";
import { Message } from "../../types/mcp/message";
import { OllamaTool } from "../../types/ollama";
import { ChatHistoryEntry } from "../../types/db/mongo/chatHistory";

class ChatRequest {
	private id: UUID;
	private name: string;
	private messages: Message[];
	private tools: OllamaTool[];

	constructor(tools: OllamaTool[], existingChatHistory?: ChatHistoryEntry) {
		if (existingChatHistory) {
			this.id = existingChatHistory.id;
			this.name = existingChatHistory.name;
			this.messages = existingChatHistory.messages.map((message) => {
				if (message.role === "tool") {
					return {
						role: "tool",
						content: message.content,
						tool_name: message.tool_name,
					};
				}

				if (message.role === "assistant") {
					return {
						role: "assistant",
						content: message.content,
						tool_calls: message.tool_calls,
					};
				}

				return {
					role: message.role,
					content: message.content,
				};
			});
		} else {
			this.id = randomUUID();
			this.name = "";
			this.messages = [
				{
					role: "system",
					content:
						"You are a chat assistant. Prefer answering directly from general knowledge. " +
						"Call a tool only when the user explicitly needs external or real-time data that the tool provides. " +
						"If no tool is needed, do not call any tools. If you call a tool, never invent the result. " +
						"When a tool response is present, treat it as authoritative and use it directly in your answer. " +
						"Never claim you cannot access real-time data when a tool response is available."
				},
			];
		}
		this.tools = tools;
	}

	getId(): UUID {
		return this.id;
	}

	setId(id: UUID) {
		this.id = id;
	}

	setName(name: string) {
		this.name = name;
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
