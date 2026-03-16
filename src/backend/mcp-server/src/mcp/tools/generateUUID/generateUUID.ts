import { randomUUID } from "node:crypto";
import { description } from "./description";
import { GenerateUUIDArgs } from "./GenerateUUIDArgs";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const DEFAULT_COUNT = 1;
const MAX_COUNT = 100;

const getSafeCount = (count?: number): number => {
	if (!Number.isFinite(count)) {
		return DEFAULT_COUNT;
	}

	const normalizedCount = Math.floor(count);

	if (normalizedCount < 1) {
		return DEFAULT_COUNT;
	}

	if (normalizedCount > MAX_COUNT) {
		return MAX_COUNT;
	}

	return normalizedCount;
};

const generateUUID: Tool = {
	name: "generateUUID",
	method: "generateUUID",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: GenerateUUIDArgs) => {
		const count = getSafeCount(args.count);
		const uuids = Array.from({ length: count }, () => randomUUID());

		return {
			content: [
				{
					type: "text",
					text: uuids.join("\n"),
				},
			],
		};
	},
};

export { generateUUID };
