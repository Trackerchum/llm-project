type JsonRpcSuccess<TResult> = {
    jsonrpc: "2.0";
    id: string | number | null;
    result: TResult;
};

type JsonRpcError = {
    jsonrpc: "2.0";
    id: string | number | null;
    error: {
        code: number;
        message: string;
        data?: unknown;
    };
};

type JsonRpcResponse<TResult> = JsonRpcSuccess<TResult> | JsonRpcError;

export { type JsonRpcResponse, type JsonRpcSuccess, type JsonRpcError }