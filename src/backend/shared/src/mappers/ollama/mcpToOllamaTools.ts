import { OllamaTool } from "../../types/ollama";

type MCPListTool = {
	name: string;
	description?: string;
	inputSchema?: Record<string, unknown>;
};

const mcpToOllamaTools = (tools: MCPListTool[]): OllamaTool[] =>
	tools.map((tool) => ({
		type: "function",
		function: {
			name: tool.name,
			description: tool.description,
			parameters: tool.inputSchema,
		},
	}));

export { mcpToOllamaTools };
