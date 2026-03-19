import { Tool } from "@Shared/types/mcp/Tool";
import { generateGUID } from "./generateGUID";
import { generateHash } from "./generateHash";
import { generateRandomNumber } from "./generateRandomNumber";
import { generateUUID } from "./generateUUID";
import { getDate } from "./getDate";
import { getTime } from "./getTime";
import { searchWeb } from "./searchWeb";

const tools: Tool[] = [
    getDate,
    getTime,
    generateHash,
    generateUUID,
    generateGUID,
    generateRandomNumber,
    searchWeb
];

export { tools };
