import { UUID } from "crypto";
import { Message } from "../../../mcp/message";
import { OllamaTool } from "../../../ollama";

interface ChatHistoryEntry {
	id: UUID;
	messages: Message[];
	tools: OllamaTool[];
}

export { type ChatHistoryEntry };
