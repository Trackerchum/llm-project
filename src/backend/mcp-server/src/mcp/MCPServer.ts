import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { tools } from './tools';
import { Implementation } from '@modelcontextprotocol/sdk/types';

class MCPServer extends McpServer {

    constructor(serverInformation: Implementation) {
        super(serverInformation);

        tools.forEach(tool => this.registerTool(
            tool.name,
            tool.config,
            tool.cb
        ));
    }
}

export { MCPServer }