import { createRequestId } from "../helpers/createRequestId";
import { JsonRpcResponse } from "../types/MCP";
import { JsonRpcRequest } from "../types/MCP/JsonRpcRequest";
import { Client } from "./Client";

export class MCPClient {
	private client: Client;
	private sessionId: string | null = null;

	constructor() {
		this.client = new Client("/api/mcp");
	}

	private normalizeSessionId(value: string): string {
		return value.split(",")[0].trim();
	}

	private getSessionIdFromHeaders(headers: Headers): string | null {
		const direct =
			headers.get("mcp-session-id") ?? headers.get("Mcp-Session-Id") ?? headers.get("x-mcp-session-id");
		if (direct) {
			return this.normalizeSessionId(direct);
		}

		let discovered: string | null = null;
		headers.forEach((value, name) => {
			const lowered = name.toLowerCase();
			if (!discovered && (lowered === "mcp-session-id" || lowered === "x-mcp-session-id")) {
				discovered = value;
			}
		});
		if (discovered) {
			return this.normalizeSessionId(discovered);
		}

		return null;
	}

	private setSessionHeader(sessionId: string | null) {
		if (!sessionId) {
			return;
		}

		this.sessionId = sessionId;

		// Use canonical header to avoid duplicate case-variants being merged.
		this.client.defaultHeaders = {
			...this.client.defaultHeaders,
			"mcp-session-id": sessionId,
		};
	}

	getSessionId(): string | null {
		return this.sessionId;
	}

	private clearSessionHeader() {
		this.sessionId = null;

		const headers = new Headers(this.client.defaultHeaders);
		headers.delete("mcp-session-id");
		this.client.defaultHeaders = headers;
	}

	private formatErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			return error.message;
		}

		if (typeof error === "string") {
			return error;
		}

		if (error && typeof error === "object") {
			const candidate = error as { message?: unknown; error?: unknown };

			if (typeof candidate.message === "string") {
				return candidate.message;
			}

			if (candidate.error && typeof candidate.error === "object") {
				const nested = candidate.error as { message?: unknown };
				if (typeof nested.message === "string") {
					return nested.message;
				}
			}

			try {
				return JSON.stringify(error);
			} catch {
				return "Unknown error object";
			}
		}

		return String(error);
	}

	private isJsonRpcErrorLike(error: unknown): error is {
		jsonrpc: "2.0";
		id: string | number | null;
		error: { code: number; message: string; data?: unknown };
	} {
		if (!error || typeof error !== "object") {
			return false;
		}

		const candidate = error as {
			jsonrpc?: unknown;
			id?: unknown;
			error?: { code?: unknown; message?: unknown; data?: unknown };
		};

		return (
			candidate.jsonrpc === "2.0" &&
			candidate.error !== undefined &&
			typeof candidate.error === "object" &&
			typeof candidate.error.code === "number" &&
			typeof candidate.error.message === "string"
		);
	}

	async request<TResult, TParams = Record<string, unknown>>(
		method: string,
		params?: TParams,
	): Promise<JsonRpcResponse<TResult>> {
		const payload: JsonRpcRequest<TParams> = {
			jsonrpc: "2.0",
			id: createRequestId(),
			method,
			...(params !== undefined ? { params } : {}),
		};

		const response = await this.client.post<JsonRpcResponse<TResult>>("", payload);

		this.setSessionHeader(this.getSessionIdFromHeaders(response.headers));

		if (response.isError) {
			if (this.isJsonRpcErrorLike(response.error)) {
				return response.error as JsonRpcResponse<TResult>;
			}

			return {
				jsonrpc: "2.0",
				id: payload.id,
				error: {
					code: -32000,
					message: this.formatErrorMessage(response.error),
					...(response.error && typeof response.error === "object" ? { data: response.error } : {}),
				},
			};
		}

		return response.data;
	}

	async initialize(params: Record<string, unknown>) {
		// A fresh initialize must not include an old session id.
		this.clearSessionHeader();

		const response = await this.request("initialize", params);

		if (!("error" in response)) {
			if (!this.sessionId) {
				return {
					jsonrpc: "2.0",
					id: response.id,
					error: {
						code: -32000,
						message: "Initialize succeeded but no MCP session id was returned by the server.",
					},
				};
			}

			await this.client.post("", {
				jsonrpc: "2.0",
				method: "notifications/initialized",
				params: {},
			});
		}

		return response;
	}

	toolsList(params: Record<string, unknown> = {}) {
		return this.request("tools/list", params);
	}

	callTool(params: { name: string; arguments?: Record<string, unknown> }) {
		return this.request("tools/call", params);
	}
}
