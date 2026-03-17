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
						"Call a tool when the user explicitly asks for a capability provided by an available tool, " +
						"or when external/real-time data is required. " +
						"If no tool is needed, do not call any tools. If you call a tool, never invent the result. " +
						"Never output pseudo tool-call JSON like {name, parameters} in assistant text; " +
						"use actual tool calls instead. " +
						"When a tool response is present, it is authoritative. " +
						"Your very next assistant message must directly answer using that tool output. " +
						"For output-producing requests (for example GUIDs, random numbers, hashes, date, time), " +
						"return the produced value(s) clearly and do not replace them with explanations of how you would do it. " +
						"Do not claim inability, do not mention browser/runtime limitations, do not ask to try again, " +
						"and do not suggest installing libraries when a valid tool result already exists. " +
						"Never claim you cannot access real-time data when a tool response is available.",
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
