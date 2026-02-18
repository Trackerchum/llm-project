import { z } from "zod";

export const parameters = z.object({
    text: z.string()
        .min(1, "Text cannot be empty")
        .describe("Text to echo back"),
})