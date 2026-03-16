import z from "zod";
import { inputSchema } from "./inputSchema";


type GetTimeArgs = z.infer<typeof inputSchema>;

export { type GetTimeArgs }