import { randomUUID } from "node:crypto";
import { description } from "./description";
import { GenerateGUIDArgs } from "./GenerateGUIDArgs";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const DEFAULT_COUNT = 1;
const MAX_COUNT = 100;

const getSafeCount = (count?: number | string): number => {
	const normalizedInput = typeof count === "string" ? Number(count.trim()) : count;

	if (!Number.isFinite(normalizedInput)) {
		return DEFAULT_COUNT;
	}

	const normalizedCount = Math.floor(normalizedInput);

	if (normalizedCount < 1) {
		return DEFAULT_COUNT;
	}

	if (normalizedCount > MAX_COUNT) {
		return MAX_COUNT;
	}

	return normalizedCount;
};

const generateGUID: Tool = {
	name: "generateGUID",
	method: "generateGUID",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: GenerateGUIDArgs) => {
		const count = getSafeCount(args.count);
		const guids = Array.from({ length: count }, () => randomUUID());

		return {
			content: [
				{
					type: "text",
					text: guids.join("\n"),
				},
			],
		};
	},
};

export { generateGUID };
