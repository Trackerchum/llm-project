import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tools } from './tools';
import { Implementation } from '@modelcontextprotocol/sdk/types';

class MCPServer extends McpServer {

    constructor(serverInformation: Implementation) {
        super(serverInformation);

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