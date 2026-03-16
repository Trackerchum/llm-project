import { randomInt } from "node:crypto";
import { description } from "./description";
import { GenerateRandomNumberArgs } from "./GenerateRandomNumberArgs";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

const getSafeBounds = (min?: number, max?: number): { min: number; max: number } => {
	const safeMin = Number.isFinite(min) ? Math.floor(min) : DEFAULT_MIN;
	const safeMax = Number.isFinite(max) ? Math.floor(max) : DEFAULT_MAX;

	if (safeMin <= safeMax) {
		return { min: safeMin, max: safeMax };
	}

	return { min: safeMax, max: safeMin };
};

const generateRandomNumber: Tool = {
	name: "generateRandomNumber",
	method: "generateRandomNumber",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: GenerateRandomNumberArgs) => {
		const { min, max } = getSafeBounds(args.min, args.max);
		const number = randomInt(min, max + 1);

		return {
			content: [
				{
					type: "text",
					text: String(number),
				},
			],
		};
	},
};

export { generateRandomNumber };
