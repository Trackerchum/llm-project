import { ServerOptions } from "../types/cookieHandling";

type FetcherResponse<T> =
	| { isError: false; data: T }
	| { isError: true; error: string | Error };

const fetcher = async <T>(
	url: string,
	options: RequestInit,
	serverOptions?: ServerOptions,
): Promise<FetcherResponse<T>> => {
	const incomingHeaders: { [key: string]: any } = serverOptions?.req
		? { ...serverOptions.req.headers }
		: {};

	options.headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
		...(options.headers || {}),
		...incomingHeaders,
	};

	const response: Response = await fetch(url, options);

	let error: Error | string;

	if (response.ok) {
		try {
			let data = await response.json();
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