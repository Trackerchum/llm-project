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
	chatId: string;
};

export class ChatClient {
	private chatClient: Client;
	private chatHistoryClient: Client;

	constructor() {
		this.chatClient = new Client("/api/chat");
		this.chatHistoryClient = new Client("/api/chatHistory");
	}

	getChatHistories = async (options: RequestInit = {}) => {
		return this.chatHistoryClient.get<ChatHistoriesResponse>("/histories", options);
	};

	submitPrompt = async (payload: { prompt: string; chatId: string }, options: RequestInit = {}) => {
		return this.chatClient.post<SubmitPromptResponse>("", payload, options);
	};

	deleteChatHistory = async (chatId: string, options: RequestInit = {}) => {
		return this.chatHistoryClient.delete<DeleteChatHistoryResponse>(
			`/${encodeURIComponent(chatId)}`,
			options,
		);
	};
}
