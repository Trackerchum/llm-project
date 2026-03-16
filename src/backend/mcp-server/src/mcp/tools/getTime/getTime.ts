import { description } from "./description";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const DEFAULT_TIMEZONE = "UTC";
const DEFAULT_LOCALE = "en-US";

const getSafeLocale = (locale: unknown): string => {
	if (typeof locale !== "string") {
		return DEFAULT_LOCALE;
	}

	try {
		return Intl.getCanonicalLocales(locale)[0] ?? DEFAULT_LOCALE;
	} catch {
		return DEFAULT_LOCALE;
	}
};

const getSafeTimeZone = (timezone: unknown): string => {
	if (typeof timezone !== "string") {
		return DEFAULT_TIMEZONE;
	}

	try {
		new Intl.DateTimeFormat("en-US", { timeZone: timezone });
		return timezone;
	} catch {
		return DEFAULT_TIMEZONE;
	}
};

const getTime: Tool = {
	name: "getTime",
	method: "getTime",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: Record<string, unknown>) => {
		const locale = getSafeLocale(args.locale);
		const timezone = getSafeTimeZone(args.timezone);

		const formattedTime = new Intl.DateTimeFormat(locale, {
			timeStyle: "long",
			timeZone: timezone,
		}).format(new Date());

		return {
			content: [
				{
					type: "text",
					text: formattedTime,
				},
			],
		};
	},
};

export { getTime };
