import { z } from "zod";

export const inputSchema = z.object({
	count: z
		.union([
			z.number().int().min(1).max(100),
			z
				.string()
				.trim()
				.regex(/^\d+$/, "Count must be a whole number between 1 and 100.")
				.transform((value) => Number(value))
				.refine((value) => value >= 1 && value <= 100, {
					message: "Count must be between 1 and 100.",
				}),
		])
		.optional()
		.describe("Optional number of GUIDs to generate. Accepts numbers or numeric strings. Defaults to 1, max 100."),
});
