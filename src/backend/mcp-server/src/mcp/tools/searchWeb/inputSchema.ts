import { z } from "zod";

export const inputSchema = z.object({
	query: z.string().min(1).describe("The web search query."),
	maxResults: z
		.coerce.number()
		.int()
		.min(1)
		.max(10)
		.optional()
		.describe("Optional number of results to return. Accepts numbers or numeric strings. Defaults to 5, max 10."),
});
