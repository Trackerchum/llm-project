import { randomUUID } from "node:crypto";
import { MCP_SESSION_ID } from "../../constants";
import { JsonRpcRequest, JsonRpcResponse } from "../../types/mcp";

type CallToolParams = {
	name: string;
	arguments?: Record<string, unknown>;
};

export class MCPClient {
	private readonly baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	private createHeaders(sessionId?: string) {
		const headers = new Headers({
			"content-type": "application/json",
			accept: "application/json, text/event-stream",
		});

		if (sessionId) {
			headers.set(MCP_SESSION_ID, sessionId);
		}

		return headers;
	}

	private isJsonRpcResponse<TResult>(value: unknown): value is JsonRpcResponse<TResult> {
		if (!value || typeof value !== "object") {
			return false;
		}

		const candidate = value as {
			jsonrpc?: unknown;
			result?: unknown;
			error?: { code?: unknown; message?: unknown; data?: unknown };
		};

		if (candidate.jsonrpc !== "2.0") {
			return false;
		}

		if (candidate.error !== undefined) {
			return typeof candidate.error.code === "number" && typeof candidate.error.message === "string";
		}

		return "result" in candidate;
	}

	private formatErrorMessage(error: unknown): string {
		if (error instanceof Error) {
			return `${error.name}: ${error.message}`;
		}

		if (typeof error === "string") {
			return error;
		}

		try {
			return JSON.stringify(error);
		} catch {
			return "Unknown MCP error";
		}
	}

	private serializeError(error: unknown): Record<string, unknown> {
		if (error instanceof Error) {
			return {
				name: error.name,
				message: error.message,
				stack: error.stack,
			};
		}

		return { raw: this.formatErrorMessage(error) };
	}

	private async request<TResult, TParams = Record<string, unknown>>(
		method: string,
		params?: TParams,
		sessionId?: string,
	): Promise<{ response: JsonRpcResponse<TResult>; sessionId: string | null }> {
		const payload: JsonRpcRequest<TParams> = {
			jsonrpc: "2.0",
			id: randomUUID(),
			method,
			...(params !== undefined ? { params } : {}),
		};

		let phase: "fetch" | "parse" = "fetch";

		try {
			const response = await fetch(this.baseUrl, {
				method: "POST",
				headers: this.createHeaders(sessionId),
				body: JSON.stringify(payload),
			});

			const responseSessionId = response.headers.get(MCP_SESSION_ID);

			phase = "parse";
			const responseBody = (await response.json()) as unknown;
			if (this.isJsonRpcResponse<TResult>(responseBody)) {
				return { response: responseBody, sessionId: responseSessionId };
			}

			return {
				response: {
					jsonrpc: "2.0",
					id: payload.id ?? null,
					error: {
						code: -32000,
						message: `Unexpected response from MCP server (HTTP ${String(response.status)}).`,
						data: responseBody,
					},
				},
				sessionId: responseSessionId,
			};
		} catch (error) {
			const formattedError = this.formatErrorMessage(error);
			return {
				response: {
					jsonrpc: "2.0",
					id: payload.id ?? null,
					error: {
						code: -32000,
						message: `MCP request failed while calling "${method}" during ${phase} phase (${this.baseUrl}): ${formattedError}`,
						data: {
							method,
							phase,
							baseUrl: this.baseUrl,
							hasSessionId: Boolean(sessionId),
							requestId: payload.id ?? null,
							cause: this.serializeError(error),
						},
					},
				},
				sessionId: sessionId ?? null,
			};
		}
	}

	async initialize(
		params: Record<string, unknown> = {},
	): Promise<{ response: JsonRpcResponse<Record<string, unknown>>; sessionId: string | null }> {
		return this.request<Record<string, unknown>>("initialize", params);
	}

	async sendInitialized(sessionId: string): Promise<void> {
		const payload: JsonRpcRequest<Record<string, unknown>> = {
			jsonrpc: "2.0",
			method: "notifications/initialized",
			params: {},
		};

		try {
			const response = await fetch(this.baseUrl, {
				method: "POST",
				headers: this.createHeaders(sessionId),
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error(
					`Failed to send MCP initialized notification (${String(response.status)} ${response.statusText}) to ${this.baseUrl}.`,
				);
			}
		} catch (error) {
			throw new Error(
				`MCP notification "notifications/initialized" failed (${this.baseUrl}): ${this.formatErrorMessage(error)}`,
			);
		}
	}

	async toolsList(
		sessionId: string,
		params: Record<string, unknown> = {},
	): Promise<JsonRpcResponse<Record<string, unknown>>> {
		const { response } = await this.request<Record<string, unknown>>("tools/list", params, sessionId);
		return response;
	}

	async callTool(sessionId: string, params: CallToolParams): Promise<JsonRpcResponse<Record<string, unknown>>> {
		const { response } = await this.request<Record<string, unknown>, CallToolParams>(
			"tools/call",
			params,
			sessionId,
		);
		return response;
	}
}
