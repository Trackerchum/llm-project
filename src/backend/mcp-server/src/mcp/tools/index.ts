import { Tool } from "@Shared/types/mcp/Tool";
import { generateHash } from "./generateHash";
import { generateUUID } from "./generateUUID";
import { getDate } from "./getDate";
import { getTime } from "./getTime";

const tools: Tool[] = [getDate, getTime, generateHash, generateUUID];

export { tools };
