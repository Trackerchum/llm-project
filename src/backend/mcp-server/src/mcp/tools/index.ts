import { Tool } from "@Shared/types/mcp/Tool";
import { echo } from "./echo";
import { getDateTime } from "./getDateTime";

const tools: Tool[] = [echo, getDateTime];

export { tools };
