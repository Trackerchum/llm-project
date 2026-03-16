import { Tool } from "@Shared/types/mcp/Tool";
import { generateHash } from "./generateHash";
import { generateUUID } from "./generateUUID";
import { getDate } from "./getDate";
import { getTime } from "./getTime";
import { randomNumber } from "./randomNumber";

const tools: Tool[] = [getDate, getTime, generateHash, generateUUID, randomNumber];

export { tools };
