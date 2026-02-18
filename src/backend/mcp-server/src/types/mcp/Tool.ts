import { z } from "zod";

type Tool = {
    name: string;
    method: string;
    config: {
        description: string,
        parameters: z.ZodObject<any, any>,
    },
    methods: {
        [domain: string]: {
            [permission: string]: boolean
        };
    };
};

export { type Tool }