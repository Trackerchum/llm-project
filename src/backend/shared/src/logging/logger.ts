import { performance } from "node:perf_hooks";

export const logger = async <T>(actionName: string, fn: (...args: any[]) => Promise<T>, extraInfo?: Record<string, unknown>): Promise<T> => {
    const start = performance.now();
    try {
        const response = await fn();
        console.info(JSON.stringify({
            action_name: actionName,
            result: "SUCCESS",
            time_elapsed: `${performance.now() - start}ms`,
            ...extraInfo
        }));
        return response;
    } catch (error) {
        console.error(JSON.stringify({
            action_name: actionName,
            result: "ERROR",
            error,
            time_elapsed: `${performance.now() - start}ms`,
            ...extraInfo
        }));
        throw new Error(`Error fetching ${actionName}: ${error}`);
    }
}