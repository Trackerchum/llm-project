import { createRequestId } from "../helpers/createRequestId";
import { JsonRpcResponse } from "../types/MCP";
import { JsonRpcRequest } from "../types/MCP/JsonRpcRequest";
import { Client } from "./Client";


export class MCPClient {
    private client: Client;

    constructor() {
        this.client = new Client("/api/mcp");
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

    initialize(params: Record<string, unknown>) {
        return this.request("initialize", params);
    }

    toolsList(params: Record<string, unknown> = {}) {
        return this.request("tools/list", params);
    }

    callTool(params: { name: string; arguments?: Record<string, unknown> }) {
        return this.request("tools/call", params);
    }
}