import { Message } from "./Message"

interface ChatHistory {
    id: string,
    name: string,
    messages: Array<Message>
}

export { type ChatHistory }