import { z } from "zod";

export const inputSchema = z.object({
	input: z.string().describe("The input text to hash."),
	algorithm: z
		.enum(["sha256", "sha384", "sha512", "md5"])
		.optional()
		.describe("Optional hashing algorithm. Defaults to sha256."),
	outputEncoding: z.enum(["hex", "base64"]).optional().describe("Optional output encoding. Defaults to hex."),
});
