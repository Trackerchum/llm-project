interface Message {
    role: "instrutions" | "user" | "system";
    content: string;
}

export { type Message }