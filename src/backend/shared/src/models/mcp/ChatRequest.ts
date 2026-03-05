import { Message, Tool } from "../../types/mcp";


class ChatRequest {
    private model: string;
    private messages: Message[];
    private tools: Tool[];
    private stream: boolean;

    constructor(config?: {
        model?: string,
        initialInstructions?: Message,
        tools?: Tool[],
        stream?: boolean
    }) {
        this.model = config?.model ?? "llama3.2:1b";
        this.messages = config?.initialInstructions ? [config.initialInstructions] : [{
            role: "instrutions",
            content: "You may call tools when needed. If you call a tool, do not guess the tool output."
        }];
        this.tools = config?.tools ?? [];
        this.stream = config?.stream ?? false;
    }

    setModel(model: string) {
        this.model = model;
    }

    addMessage(message: Message) {
        this.messages.push(message);
    }

    setTools(tools: Tool[]) {
        this.tools = tools;
    }

    setStream(stream: boolean) {
        this.stream = stream;
    }

    getChatRequest() {
        return {
            model: this.model,
            messages: this.messages,
            tools: this.tools,
            stream: this.stream
        }
    }
}

export { ChatRequest }