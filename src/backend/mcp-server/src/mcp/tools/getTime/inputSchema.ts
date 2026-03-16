import { z } from "zod";

const optionalTrimmedString = z.preprocess(
	(value) => {
		if (typeof value !== "string") {
			return value;
		}

		const trimmedValue = value.trim();
		return trimmedValue.length > 0 ? trimmedValue : undefined;
	},
	z.string().optional(),
);

export const inputSchema = z.object({
	locale: optionalTrimmedString
		.refine((value) => value === undefined || value.length >= 2, "Locale cannot be empty")
		.optional()
		.describe("Optional BCP 47 locale, for example en-US or fr-FR."),
	timezone: optionalTrimmedString
		.refine((value) => value === undefined || value.length >= 1, "Timezone cannot be empty")
		.optional()
		.describe("Optional IANA timezone, for example UTC or America/New_York. Defaults to UTC."),
});
