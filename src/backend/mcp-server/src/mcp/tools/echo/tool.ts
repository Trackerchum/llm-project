import { description } from "./description";
import { parameters } from "./parameters";
import { Tool } from "../../../types/mcp";

const echoModule: Tool = {
    name: "echo",
    method: "echo",
    config: {
        description,
        parameters,
    },
    methods: {
        'echo': {
            read: true,
        },
    }
};

export { echoModule };