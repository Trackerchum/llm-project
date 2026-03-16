import { z } from "zod";

export const inputSchema = z.object({
	locale: z
		.string()
		.min(2, "Locale cannot be empty")
		.optional()
		.describe("Optional BCP 47 locale, for example en-US or fr-FR."),
	timezone: z
		.string()
		.min(1, "Timezone cannot be empty")
		.optional()
		.describe("Optional IANA timezone, for example UTC or America/New_York. Defaults to UTC."),
});
