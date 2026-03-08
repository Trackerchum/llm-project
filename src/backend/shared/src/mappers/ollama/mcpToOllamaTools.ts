import { MCPListTool, OllamaTool } from "../../types/ollama";

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
