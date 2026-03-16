import { ToolCall } from "./ToolCall";


type Message =
	| {
		role: "system" | "user";
		content: string;
	}
	| {
		role: "assistant";
		content: string;
		tool_calls?: ToolCall[];
	}
	| {
		role: "tool";
		content: string;
		tool_name: string;
	};

export { type Message };
