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
        const locale = typeof args.locale === "string" ? args.locale : "en-US";

        const formattedDateTime = new Intl.DateTimeFormat(locale, {
            dateStyle: "full",
            timeStyle: "medium",
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