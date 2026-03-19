import { description } from "./description";
import { SearchWebArgs } from "./SearchWebArgs";
import { inputSchema } from "./inputSchema";
import { Tool } from "@Shared/types/mcp";

const DEFAULT_MAX_RESULTS = 5;
const MAX_SNIPPET_LENGTH = 280;

type SearchResult = {
	title: string;
	url: string;
	snippet: string;
};

const getSafeMaxResults = (maxResults?: number): number => {
	if (!maxResults || Number.isNaN(maxResults)) {
		return DEFAULT_MAX_RESULTS;
	}

	return Math.min(Math.max(Math.trunc(maxResults), 1), 10);
};

const truncate = (text: string): string => {
	if (text.length <= MAX_SNIPPET_LENGTH) {
		return text;
	}

	return `${text.slice(0, MAX_SNIPPET_LENGTH - 3)}...`;
};

const decodeBasicEntities = (value: string): string =>
	value
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", '"')
		.replaceAll("&#34;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&#x27;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&nbsp;", " ");

const stripHtmlTags = (value: string): string => value.replace(/<[^>]+>/g, "");

const sanitizeText = (value: string): string => {
	const decoded = decodeBasicEntities(stripHtmlTags(value));
	return decoded.replace(/\s+/g, " ").trim();
};

const normalizeResultUrl = (urlValue: string): string => {
	try {
		const url = new URL(urlValue, "https://duckduckgo.com");
		const redirectTarget = url.searchParams.get("uddg");
		if (redirectTarget) {
			return decodeURIComponent(redirectTarget);
		}

		return url.toString();
	} catch {
		return urlValue;
	}
};

const extractResultsFromLiteHtml = (html: string): SearchResult[] => {
	const linkMatches = [...html.matchAll(/<a[^>]*class="result-link"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
	const snippetMatches = [...html.matchAll(/<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi)];

	return linkMatches.map((match, index) => {
		const rawUrl = match[1] ?? "";
		const rawTitle = match[2] ?? "Result";
		const rawSnippet = snippetMatches[index]?.[1] ?? "";

		return {
			title: sanitizeText(rawTitle) || "Result",
			url: normalizeResultUrl(rawUrl),
			snippet: truncate(sanitizeText(rawSnippet)),
		};
	});
};

const buildResponseText = (query: string, results: SearchResult[]): string => {
	if (results.length === 0) {
		return `No web results found for "${query}".`;
	}

	const formatted = results
		.map((result, index) => `${index + 1}. ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}`)
		.join("\n\n");

	return `Web search results for "${query}":\n\n${formatted}`;
};

const searchWeb: Tool = {
	name: "searchWeb",
	method: "searchWeb",
	config: {
		description,
		inputSchema,
	},
	cb: async (args: SearchWebArgs) => {
		const maxResults = getSafeMaxResults(args.maxResults);
		const query = args.query.trim();

		const url = new URL("https://lite.duckduckgo.com/lite/");
		url.searchParams.set("q", query);

		try {
			const response = await fetch(url, {
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; MCPServer/1.0)",
					Accept: "text/html,application/xhtml+xml",
				},
			});

			if (!response.ok) {
				throw new Error(`DuckDuckGo returned HTTP ${response.status}`);
			}

			const payload = await response.text();
			const results = extractResultsFromLiteHtml(payload);

			const uniqueResults = results.filter(
				(result, index) => results.findIndex((candidate) => candidate.url === result.url) === index,
			);
			const output = buildResponseText(query, uniqueResults.slice(0, maxResults));

			return {
				content: [
					{
						type: "text",
						text: output,
					},
				],
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";

			return {
				content: [
					{
						type: "text",
						text: `Web search failed for "${query}": ${message}`,
					},
				],
			};
		}
	},
};

export { searchWeb };
