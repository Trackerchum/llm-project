import z from "zod";
import { inputSchema } from "./inputSchema";

type GenerateHashArgs = z.infer<typeof inputSchema>;

export { type GenerateHashArgs };
