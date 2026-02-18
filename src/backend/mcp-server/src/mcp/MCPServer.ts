import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tools } from './tools';

class MCPServer extends McpServer {

    constructor() {
        super({
            name: 'MCPServer',
            version: '1.0.0'
        });
        tools.forEach(tool => this.registerTool(
            tool.name,
            tool.config,
            async (args: Record<string, unknown>) => { // TODO schema for args
                return {
                    content: [
                        {
                            type: "text",
                            text: args.text as string,
                        },
                    ],
                };
            }
        ));
    }
}

export { MCPServer }