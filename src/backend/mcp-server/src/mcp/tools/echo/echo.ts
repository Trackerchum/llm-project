import { description } from "./description";
import { inputSchema } from "./inputSchema";
import { Tool } from "../../../types/mcp";

const echo: Tool = {
	name: "echo",
	method: "echo",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: Record<string, unknown>) => {
		// TODO schema for args
		return {
			content: [
				{
					type: "text",
					text: `echo: ${args.text as string}`,
				},
			],
		};
	},
};

export { echo };
