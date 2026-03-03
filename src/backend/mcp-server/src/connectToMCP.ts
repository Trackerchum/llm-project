import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import { MCPServer } from "./mcp/MCPServer";
import { randomUUID } from "node:crypto";
import { Express } from "express";

async function connectToMCP(config: { app: Express, port: number, corsOrigin: string }): Promise<Express> {
    const transports = new Map<string, StreamableHTTPServerTransport>();
    const createTransportForSession = async (sessionId: string) => {
        const server = new MCPServer({
            name: "MCPServer",
            version: "1.0.0",
            description: "MCPServer",
        });

        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => sessionId,
            enableJsonResponse: true,
            onsessionclosed: (sessionId) => {
                transports.delete(sessionId);
            },
        });

        await server.connect(transport);
        return transport;
    };

    config.app.all("/mcp", async (req, res) => {
        const sessionId = req.header("mcp-session-id");

        let transport = sessionId ? transports.get(sessionId) : undefined;
        const isInitializeRequest = req.method === "POST" && req.body?.method === "initialize";

        if (!transport) {
            if (sessionId && !isInitializeRequest) {
                res.status(404).json({
                    jsonrpc: "2.0",
                    id: null,
                    error: {
                        code: -32000,
                        message: "Session not found",
                    },
                });
                return;
            }

            if (!isInitializeRequest) {
                res.status(400).json({
                    jsonrpc: "2.0",
                    id: null,
                    error: {
                        code: -32000,
                        message: "Bad Request: mcp-session-id header is required",
                    },
                });
                return;
            }

            const newSessionId = randomUUID();
            transport = await createTransportForSession(newSessionId);
            // Register immediately so the follow-up initialized notification can resolve.
            transports.set(newSessionId, transport);
        }

        await transport.handleRequest(req, res, req.body);
    });

    const httpServer = config.app.listen(config.port, () => {
        console.log(`MCP Server Starter (HTTP) listening on http://localhost:${String(port)}/mcp`);
        console.log(`SSE endpoint: GET http://localhost:${String(port)}/mcp`);
        console.log(`JSON-RPC endpoint: POST http://localhost:${String(port)}/mcp`);
        console.log(`CORS origin: ${config.corsOrigin}`);
    });

    process.on("SIGINT", () => {
        console.log("Shutting down HTTP server...");
        void Promise.all(Array.from(transports.values()).map((transport) => transport.close()));
        httpServer.close(() => {
            process.exit(0);
        });
    });

    return config.app;
}

export { connectToMCP }