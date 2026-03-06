interface Message {
    role: "assistant" | "user";
    content: string;
}

export { type Message }