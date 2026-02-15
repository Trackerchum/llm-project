import { performance } from "node:perf_hooks";

export const logger = async <T>(name: string, fn: (...args: any[]) => Promise<T>, extraInfo?: Record<string, unknown>): Promise<T> => {
    const start = performance.now();
    try {
        const response = await fn();
        console.info(JSON.stringify({
            name,
            result: "SUCCESS",
            time_elapsed: performance.now() - start,
            ...extraInfo
        }));
        return response;
    } catch (error) {
        console.error(JSON.stringify({
            name,
            result: "ERROR",
            error,
            time_elapsed: performance.now() - start,
            ...extraInfo
        }));
        throw new Error(`Error fetching ${name}: ${error}`);
    }
}