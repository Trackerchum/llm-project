import { z } from "zod";

export const inputSchema = z.object({
	min: z.number().int().optional().describe("Optional minimum value (inclusive). Defaults to 0."),
	max: z.number().int().optional().describe("Optional maximum value (inclusive). Defaults to 100."),
});
