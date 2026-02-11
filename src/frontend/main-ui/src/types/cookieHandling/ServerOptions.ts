import { CookieSerializeOptions } from "cookie";
import { IncomingMessage, ServerResponse } from "http";

export interface ServerOptions extends CookieSerializeOptions {
	res?: ServerResponse;
	req?: IncomingMessage & {
		cookies?:
			| { [key: string]: string }
			| Partial<{ [key: string]: string }>;
	};
}