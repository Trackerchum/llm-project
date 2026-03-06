import { Role } from "../mcp/message"

interface OllamaChatSuccess {
    ok: true,
    response: {
        model: string,
        created_at: string,
        // TODO fix message type
        message: {
            role: Role,
            content?: string,
            tool_calls?: {
                id: string,
                function: {
                    index: number,
                    name: string,
                    arguments: Record<string, unknown>
                }
            }[]
        },
    }
}

export { type OllamaChatSuccess } 