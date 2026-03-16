import { Tool } from "@Shared/types/mcp/Tool";
import { getDate } from "./getDate";
import { getTime } from "./getTime";

const tools: Tool[] = [getDate, getTime];

export { tools };
