import { description } from "./description";
import { inputSchema } from "./inputSchema";
import { Tool } from "../../../types/mcp";

const getDateTime: Tool = {
    name: "getDateTime",
    method: "getDateTime",
    config: {
        description,
        inputSchema,
    },
    cb: async (args: Record<string, unknown>) => { // TODO schema for args
        const locale = typeof args.locale === "string" ? args.locale : undefined;

        const formattedDateTime = new Intl.DateTimeFormat(locale, {
            dateStyle: "full",
            timeStyle: "medium",
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
    }
};

export { getDateTime };