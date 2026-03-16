import z from "zod";
import { inputSchema } from "./inputSchema";

type GenerateGUIDArgs = z.infer<typeof inputSchema>;

export { type GenerateGUIDArgs };
