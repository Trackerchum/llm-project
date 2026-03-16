import { Tool } from "@Shared/types/mcp/Tool";
import { generateHash } from "./generateHash";
import { generateRandomNumber } from "./generateRandomNumber";
import { generateUUID } from "./generateUUID";
import { getDate } from "./getDate";
import { getTime } from "./getTime";

const tools: Tool[] = [getDate, getTime, generateHash, generateUUID, generateRandomNumber];

export { tools };
