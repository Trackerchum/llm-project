import { ChatHistoryEntry } from "./ChatHIstoryEntry";

interface UserChatHistoryDocument {
	_id: string;
	histories: ChatHistoryEntry[];
}

export { type UserChatHistoryDocument };
