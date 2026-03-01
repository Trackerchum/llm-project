interface JsonRpcRequest<TParams = Record<string, unknown>> {
    jsonrpc: "2.0";
    id: string;
    method: string;
    params?: TParams;
};

export { type JsonRpcRequest }