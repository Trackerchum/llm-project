import { ChatPostBody } from "./ChatPostBody";

type ChatPostBodyValidationResult =
	| {
			ok: true;
			value: ChatPostBody;
	  }
	| {
			ok: false;
			error: string;
	  };

export { type ChatPostBodyValidationResult };
