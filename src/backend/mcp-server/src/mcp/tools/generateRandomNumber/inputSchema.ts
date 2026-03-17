import { z } from "zod";

const createFlexibleIntegerStringSchema = (fieldName: "Min" | "Max") =>
	z
		.string()
		.trim()
		.transform((value, ctx) => {
			const normalized = value.match(/^\[?\s*(-?\d+)\s*\]?$/)?.[1];

			if (!normalized) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${fieldName} must be a whole number.`,
				});
				return z.NEVER;
			}

			return Number(normalized);
		})
		.refine((value) => Number.isSafeInteger(value), {
			message: `${fieldName} must be a safe whole number.`,
		});

export const inputSchema = z.object({
	min: z
		.union([
			z.number().int(),
			createFlexibleIntegerStringSchema("Min"),
		])
		.optional()
		.describe("Optional minimum value (inclusive). Accepts numbers or numeric strings. Defaults to 0."),
	max: z
		.union([
			z.number().int(),
			createFlexibleIntegerStringSchema("Max"),
		])
		.optional()
		.describe("Optional maximum value (inclusive). Accepts numbers or numeric strings. Defaults to 100."),
});
