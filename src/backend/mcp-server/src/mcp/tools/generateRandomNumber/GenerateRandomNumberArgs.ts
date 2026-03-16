import z from "zod";
import { inputSchema } from "./inputSchema";

type GenerateRandomNumberArgs = z.infer<typeof inputSchema>;

export { type GenerateRandomNumberArgs };
