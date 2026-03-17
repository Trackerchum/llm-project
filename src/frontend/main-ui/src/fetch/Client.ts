import { fetcher, FetcherResponse } from "./fetcher";

export class Client {
	baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	defaultHeaders: HeadersInit = {};

	async get<ExpectedReturn>(url: string, options: RequestInit = {}): Promise<FetcherResponse<ExpectedReturn>> {
		const path = new URL(this.baseUrl + url, window.location.origin);
		return fetcher<ExpectedReturn>(path.toString(), {
			...options,
			method: "GET",
		});
	}

	async post<ExpectedReturn>(
		url: string,
		body: Record<string, any>,
		options: RequestInit = {},
	): Promise<FetcherResponse<ExpectedReturn>> {
		const path = new URL(this.baseUrl + url, window.location.origin);
		return fetcher<ExpectedReturn>(path.toString(), {
			...options,
			method: "POST",
			headers: {
				...this.defaultHeaders,
				...(options.headers || {}),
			},
			body: JSON.stringify(body),
		});
	}

	async delete<ExpectedReturn>(url: string, options: RequestInit = {}): Promise<FetcherResponse<ExpectedReturn>> {
		const path = new URL(this.baseUrl + url, window.location.origin);
		return fetcher<ExpectedReturn>(path.toString(), {
			...options,
			method: "DELETE",
			headers: {
				...this.defaultHeaders,
				...(options.headers || {}),
			},
		});
	}
}
