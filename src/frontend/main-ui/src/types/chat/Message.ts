interface Message {
    host: "user" | "assistant";
    text: string;
}

export { type Message }