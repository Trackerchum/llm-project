import z from "zod";
import { inputSchema } from "./inputSchema";

type GenerateUUIDArgs = z.infer<typeof inputSchema>;

export { type GenerateUUIDArgs };
