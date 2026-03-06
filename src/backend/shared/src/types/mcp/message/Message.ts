import { Role } from "./Role";

type Message = {
    role: Role;
    content: string;
} | {
    role: "tool",
    content: string;
    tool_name: string
}

export { type Message }