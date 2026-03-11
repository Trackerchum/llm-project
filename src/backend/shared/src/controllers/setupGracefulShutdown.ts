import { Server } from "http";
import { DependencyInjectedClasses } from "./BaseController";

interface SetupGracefulShutdownOptions {
	message?: string;
	timeoutMs?: number;
	onBeforeClose?: () => void | Promise<void>;
}

const setupGracefulShutdown = (
	httpServer: Server,
	diClasses: DependencyInjectedClasses,
	options?: SetupGracefulShutdownOptions,
) => {
	const message = options?.message ?? "Shutting down server...";
	const timeoutMs = options?.timeoutMs ?? 10000;
	const onBeforeClose = options?.onBeforeClose;
	let isShuttingDown = false;

	const shutdown = async (signal: NodeJS.Signals) => {
		if (isShuttingDown) {
			return;
		}

		isShuttingDown = true;
		console.log(`Received ${signal}. ${message}`);

		try {
			await onBeforeClose?.();
		} catch (error) {
			console.error("Error during shutdown pre-close hook.", error);
		}

		httpServer.close(async () => {
			const closeResults = await Promise.allSettled([
				diClasses.redisClient.destroy(),
				diClasses.mongoClient.destroy(),
			]);
			const hasCloseErrors = closeResults.some((result) => result.status === "rejected");
			if (hasCloseErrors) {
				console.error("Error while closing dependency clients.", closeResults);
				process.exit(1);
				return;
			}

			process.exit(0);
		});

		setTimeout(() => {
			console.error("Force exiting after shutdown timeout.");
			process.exit(1);
		}, timeoutMs).unref();
	};

	process.on("SIGINT", () => {
		void shutdown("SIGINT");
	});
	process.on("SIGTERM", () => {
		void shutdown("SIGTERM");
	});
};

export { setupGracefulShutdown };
