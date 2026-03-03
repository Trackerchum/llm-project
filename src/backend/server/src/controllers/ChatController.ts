import { Express } from "express";
import { BaseController } from "@Shared/controllers/BaseController";

export class ChatController extends BaseController {
    constructor(baseUrl: string) {
        super(baseUrl);
    }

    setupRoutes = (app: Express) => {
        app.post(this.baseUrl, async (req, res) => {

            // check for session header
            // initialise if doesn't exist.
            // send notifications/initialized
            // get tools/list, cache result?
            // call the LLM with the user message + tool definitions
            // LLM returns plain text so DONE. or...
            // LLM returns call tool getDateTime with args { date: '2026-03-04' }”
            // call tools/call with tool name and params
            // append tool result to convo, ask LLM for final result. will look like below
            /*
        system: You may call tools when needed. If you call a tool, do not guess the tool output.
        user: original question
        assistant: (tool call)
        tool: (tool output)
            */
            // return response, inc tools called and reply

            return res.json({ ok: true, response: "TODO..." });
        });
    };
}
