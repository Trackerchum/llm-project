import z from "zod";
import { inputSchema } from "./inputSchema";

type SearchWebArgs = z.infer<typeof inputSchema>;

export { type SearchWebArgs };
