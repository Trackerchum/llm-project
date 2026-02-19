import { z } from "zod";

type Tool = {
    name: string;
    method: string;
    config: {
        description: string,
        parameters: z.ZodObject<any, any>,
    },
    cb: any // TODO type for cb
};

export { type Tool }