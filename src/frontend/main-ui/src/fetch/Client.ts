import { fetcher, FetcherResponse } from './fetcher';

export class Client {
    baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    defaultHeaders: HeadersInit = {

    }

    async get<ExpectedReturn>(url: string): Promise<FetcherResponse<ExpectedReturn>> {
        const path = new URL(this.baseUrl + url, window.location.origin);
        return fetcher<ExpectedReturn>(path.toString(), {
            method: "GET",
        });
    }

    async post<ExpectedReturn>(url: string, body: string): Promise<FetcherResponse<ExpectedReturn>> {
        const path = new URL(this.baseUrl + url, window.location.origin);
        return fetcher<ExpectedReturn>(path.toString(), {
            method: "POST",
            headers: this.defaultHeaders,
            body
        });
    }
}
