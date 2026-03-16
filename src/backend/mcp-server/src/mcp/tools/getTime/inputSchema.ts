import { z } from "zod";

export const inputSchema = z.object({
	locale: z
		.string()
		.optional()
		.describe("Optional BCP 47 locale, for example en-US or fr-FR."),
	timezone: z
		.string()
		.optional()
		.describe("Optional IANA timezone, for example UTC or America/New_York. Defaults to UTC."),
});
