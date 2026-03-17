import z from "zod";
import { inputSchema } from "./inputSchema";

type GetDateArgs = z.infer<typeof inputSchema>;

export { type GetDateArgs };
