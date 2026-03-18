import { performance } from "node:perf_hooks";

const formatElapsedTime = (elapsedMs: number): string => {
	if (elapsedMs > 1000) {
		return `${(elapsedMs / 1000).toFixed(3)} seconds`;
	}

	return `${Math.floor(elapsedMs)} milliseconds`;
};

export const logger = async <T>(
	actionName: string,
	fn: (...args: any[]) => Promise<T>,
	extraInfo?: Record<string, unknown>,
): Promise<T> => {
	const start = performance.now();
	try {
		const response = await fn();
		console.info(
			JSON.stringify({
				action_name: actionName,
				result: "SUCCESS",
				time_elapsed: formatElapsedTime(performance.now() - start),
				...extraInfo,
			}),
		);
		return response;
	} catch (error) {
		console.error(
			JSON.stringify({
				action_name: actionName,
				result: "ERROR",
				error,
				time_elapsed: formatElapsedTime(performance.now() - start),
				...extraInfo,
			}),
		);
		throw new Error(`Error fetching ${actionName}: ${error}`);
	}
};
