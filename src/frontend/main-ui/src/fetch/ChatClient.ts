import { Client } from "./Client";

export type ChatHistoriesResponse = {
	ok: true;
	userId: string;
	chatHistories: Array<{
		id: string;
		name: string;
		messages: Array<{
			role: "system" | "user" | "assistant" | "tool";
			content: string;
			tool_name?: string;
		}>;
		tools: unknown[];
	}>;
};

export type SubmitPromptResponse = {
	response: string;
	chatId: string;
	name: string;
};

export type DeleteChatHistoryResponse = {
	ok: true;
	userId: string;
	chatId: string;
};

export class ChatClient {
	private client: Client;

	constructor() {
		this.client = new Client("/api/chat");
	}

	getChatHistories = async (options: RequestInit = {}) => {
		return this.client.get<ChatHistoriesResponse>("/histories", options);
	};

	submitPrompt = async (payload: { prompt: string; chatId: string }, options: RequestInit = {}) => {
		return this.client.post<SubmitPromptResponse>("", payload, options);
	};

	deleteChatHistory = async (chatId: string, options: RequestInit = {}) => {
		return this.client.delete<DeleteChatHistoryResponse>(`/${encodeURIComponent(chatId)}`, options);
	};
}
