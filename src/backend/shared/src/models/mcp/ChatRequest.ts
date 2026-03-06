import { Message } from "../../types/mcp/message";
import { OllamaTool } from "../../types/ollama";


class ChatRequest {
    private messages: Message[];
    private tools: OllamaTool[];

    constructor(config?: {
        model?: string,
        initialInstructions?: Message,
        tools?: OllamaTool[],
        stream?: boolean
    }) {
        this.messages = config?.initialInstructions ? [config.initialInstructions] : [{
            role: "system",
            content: "You are a chat assistant. You may call tools when needed. If you call a tool, do not guess the tool output. Only request access to named tools provided"
        }];
        this.tools = config?.tools ?? [];
    }

    addMessage(message: Message) {
        this.messages.push(message);
    }

    setTools(tools: OllamaTool[]) {
        this.tools = tools;
    }

    getChatRequest() {
        return {
            messages: this.messages,
            tools: this.tools,
        }
    }
}

export { ChatRequest }