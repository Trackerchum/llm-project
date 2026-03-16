import { z } from "zod";

export const inputSchema = z.object({
	min: z
		.union([
			z.number().int(),
			z
				.string()
				.trim()
				.regex(/^-?\d+$/, "Min must be a whole number.")
				.transform((value) => Number(value)),
		])
		.optional()
		.describe("Optional minimum value (inclusive). Accepts numbers or numeric strings. Defaults to 0."),
	max: z
		.union([
			z.number().int(),
			z
				.string()
				.trim()
				.regex(/^-?\d+$/, "Max must be a whole number.")
				.transform((value) => Number(value)),
		])
		.optional()
		.describe("Optional maximum value (inclusive). Accepts numbers or numeric strings. Defaults to 100."),
});
