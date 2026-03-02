import { Tool } from "../../types/mcp/Tool";
import { echoModule } from "./echo";
import { getDateTime } from "./getDateTime";


const tools: Tool[] = [echoModule, getDateTime]

export { tools };