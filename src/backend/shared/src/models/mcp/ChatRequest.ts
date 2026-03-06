import { Message, Tool } from "../../types/mcp";


class ChatRequest {
    private messages: Message[];
    private tools: Tool[];

    constructor(config?: {
        model?: string,
        initialInstructions?: Message,
        tools?: Tool[],
        stream?: boolean
    }) {
        this.messages = config?.initialInstructions ? [config.initialInstructions] : [{
            role: "assistant",
            content: "You may call tools when needed. If you call a tool, do not guess the tool output."
        }];
        this.tools = config?.tools ?? [];
    }

    addMessage(message: Message) {
        this.messages.push(message);
    }

    setTools(tools: Tool[]) {
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