const jsonRpcErrorCodeToHttpStatus = (code: number): number => {
    switch (code) {
        case -32700: // Parse error
        case -32600: // Invalid Request
        case -32602: // Invalid params
            return 400;
        case -32601: // Method not found
            return 404;
        case -32603: // Internal error
            return 502;
        default:
            // Server error range from JSON-RPC spec
            if (code <= -32000 && code >= -32099) {
                return 502;
            }

            return 500;
    }
};

export { jsonRpcErrorCodeToHttpStatus }