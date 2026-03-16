import { description } from "./description";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const getTime: Tool = {
	name: "getTime",
	method: "getTime",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: Record<string, unknown>) => {
		// TODO schema for args
		const locale = typeof args.locale === "string" ? args.locale : undefined;

		const formattedDateTime = new Intl.DateTimeFormat(locale, {
			dateStyle: "full",
			timeStyle: "full",
			timeZone: "UTC",
		}).format(new Date());

		return {
			content: [
				{
					type: "text",
					text: formattedDateTime,
				},
			],
		};
	},
};

export { getTime };
