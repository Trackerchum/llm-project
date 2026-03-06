interface JsonRpcSuccess<TResult> {
    jsonrpc: "2.0";
    id: string | number | null;
    result: TResult;
};

interface JsonRpcError {
    jsonrpc: "2.0";
    id: string | number | null;
    error: {
        code: number;
        message: string;
        data?: unknown;
    };
};

type JsonRpcResponse<TResult> = JsonRpcSuccess<TResult> | JsonRpcError;

export { type JsonRpcSuccess, type JsonRpcError, type JsonRpcResponse }