import z from "zod";
import { inputSchema } from "./inputSchema";

type RandomNumberArgs = z.infer<typeof inputSchema>;

export { type RandomNumberArgs };
