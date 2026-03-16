import { z } from "zod";

export const inputSchema = z.object({
	count: z
		.number()
		.int()
		.min(1)
		.max(100)
		.optional()
		.describe("Optional number of UUIDs to generate. Defaults to 1, max 100."),
});
