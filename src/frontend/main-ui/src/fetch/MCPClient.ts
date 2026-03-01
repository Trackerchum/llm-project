import { Client } from "./Client";


export class MCPClient {
    private client: Client;

    constructor() {
        this.client = new Client("/api/mcp");
    }
}