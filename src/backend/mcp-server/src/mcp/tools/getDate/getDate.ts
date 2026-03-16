import { description } from "./description";
import { GetDateArgs } from "./GetDateArgs";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const DEFAULT_TIMEZONE = "UTC";
const DEFAULT_LOCALE = "en-US";

const getSafeLocale = (locale?: string): string => {
	if (!locale) {
		return DEFAULT_LOCALE;
	}

	try {
		return Intl.getCanonicalLocales(locale)[0] ?? DEFAULT_LOCALE;
	} catch {
		return DEFAULT_LOCALE;
	}
};

const getSafeTimeZone = (timezone?: string): string => {
	if (!timezone) {
		return DEFAULT_TIMEZONE;
	}

	try {
		new Intl.DateTimeFormat("en-US", { timeZone: timezone });
		return timezone;
	} catch {
		return DEFAULT_TIMEZONE;
	}
};

const getDate: Tool = {
	name: "getDate",
	method: "getDate",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: GetDateArgs) => {
		const locale = getSafeLocale(args.locale);
		const timezone = getSafeTimeZone(args.timezone);

		const formattedDate = new Intl.DateTimeFormat(locale, {
			dateStyle: "full",
			timeZone: timezone,
		}).format(new Date());

		return {
			content: [
				{
					type: "text",
					text: formattedDate,
				},
			],
		};
	},
};

export { getDate };
