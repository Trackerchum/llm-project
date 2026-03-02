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

    private getSessionIdFromHeaders(headers: Headers): string | null {
        return headers.get("mcp-session-id") ?? headers.get("x-mcp-session-id");
    }

    private setSessionHeader(sessionId: string | null) {
        if (!sessionId) {
            return;
        }

        this.sessionId = sessionId;

        // Keep both variants for compatibility with existing backend/proxy configs.
        this.client.defaultHeaders = {
            ...this.client.defaultHeaders,
            "mcp-session-id": sessionId,
            "x-mcp-session-id": sessionId,
        };
    }

    getSessionId(): string | null {
        return this.sessionId;
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
            return {
                jsonrpc: "2.0",
                id: payload.id,
                error: {
                    code: -32000,
                    message: String(response.error),
                },
            };
        }

        return response.data;
    }

    async initialize(params: Record<string, unknown>) {
        const response = await this.request("initialize", params);

        if (!("error" in response)) {
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