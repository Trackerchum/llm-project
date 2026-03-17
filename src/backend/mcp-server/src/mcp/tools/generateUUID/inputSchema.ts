import { z } from "zod";

const stringCountSchema = z
	.string()
	.trim()
	.transform((value, ctx) => {
		const normalized = value.match(/^\[?\s*(\d+)\s*\]?$/)?.[1];

		if (!normalized) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Count must be a whole number between 1 and 100.",
			});
			return z.NEVER;
		}

		return Number(normalized);
	})
	.refine((value) => value >= 1 && value <= 100, {
		message: "Count must be between 1 and 100.",
	});

export const inputSchema = z.object({
	count: z
		.union([
			z.number().int().min(1).max(100),
			stringCountSchema,
		])
		.optional()
		.describe(
			"Optional number of UUIDs/GUIDs to generate. Accepts numbers or numeric strings. Defaults to 1, max 100.",
		),
});
