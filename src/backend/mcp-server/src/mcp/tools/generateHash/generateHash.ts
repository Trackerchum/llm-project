import { createHash } from "node:crypto";
import { description } from "./description";
import { GenerateHashArgs } from "./GenerateHashArgs";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const DEFAULT_ALGORITHM = "sha256";
const DEFAULT_OUTPUT_ENCODING = "hex";

const getSafeAlgorithm = (algorithm?: string): string => {
	if (!algorithm) {
		return DEFAULT_ALGORITHM;
	}

	return algorithm.toLowerCase();
};

const getSafeOutputEncoding = (outputEncoding?: "hex" | "base64"): "hex" | "base64" =>
	outputEncoding ?? DEFAULT_OUTPUT_ENCODING;

const generateHash: Tool = {
	name: "generateHash",
	method: "generateHash",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: GenerateHashArgs) => {
		const algorithm = getSafeAlgorithm(args.algorithm);
		const outputEncoding = getSafeOutputEncoding(args.outputEncoding);

		const hash = createHash(algorithm).update(args.input).digest(outputEncoding);

		return {
			content: [
				{
					type: "text",
					text: hash,
				},
			],
		};
	},
};

export { generateHash };
