import { ServerOptions } from "../types/cookieHandling";

type FetcherResponse<T> = { isError: false; data: T } | { isError: true; error: string | Error };

const fetcher = async <T>(
	url: string,
	options: RequestInit,
	serverOptions?: ServerOptions,
): Promise<FetcherResponse<T>> => {
	const incomingHeaders: { [key: string]: any } = serverOptions?.req ? { ...serverOptions.req.headers } : {};

	options.headers = {
		"Content-Type": "application/json",
		Accept: "application/json, text/event-stream",
		...(options.headers || {}),
		...incomingHeaders,
	};

	const response: Response = await fetch(url, options);

	let error: Error | string;

	if (response.ok) {
		try {
			const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
			let data: T;

			if (contentType.includes("text/event-stream")) {
				data = response.body as T;
			} else if (contentType.includes("application/json")) {
				data = await response.json() as T;
			} else {
				data = await response.text() as T;
			}

			return { data, isError: false };
		} catch (err) {
			error = err as Error;
		}
	} else {
		try {
			error = await response.clone().json();
		} catch (e) {
			error = await response.text();
		}
	}

	return { error, isError: true };
};

export { fetcher, type FetcherResponse };
