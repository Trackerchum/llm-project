import { ChatPostBodyValidationResult } from "./ChatPostBodyValidationResult";

const maxPromptLength = 8000;

const validateChatPostBody = (body: unknown): ChatPostBodyValidationResult => {
	if (!body || typeof body !== "object" || Array.isArray(body)) {
		return { ok: false, error: "Invalid request body." };
	}

	const { prompt, chatId } = body as {
		prompt?: unknown;
		chatId?: unknown;
	};

	if (typeof prompt !== "string" || prompt.trim().length === 0) {
		return { ok: false, error: "Error, prompt must be a non-empty string." };
	}

	if (prompt.length > maxPromptLength) {
		return { ok: false, error: `Error, prompt must be ${maxPromptLength} characters or fewer.` };
	}

	if (typeof chatId !== "string") {
		return { ok: false, error: "Error, chatId must be a string." };
	}

	return {
		ok: true,
		value: {
			prompt: prompt.trim(),
			chatId: chatId.trim(),
		},
	};
};

export { validateChatPostBody };
