import { createClient, RedisClientType } from "redis";
import { logger } from "../../logging";

export class RedisClient {
	private Client: RedisClientType;
	isConnected: boolean;

	constructor(host: string, port: number, password?: string) {
		this.Client = createClient({
			socket: {
				host: host,
				port: port,
				reconnectStrategy: (retries, cause) => {
					const message = cause?.message ?? "";
					const code =
						typeof cause === "object" && cause !== null && "code" in cause
							? String(cause.code)
							: "";

					// Stop retries immediately for auth/config errors.
					if (
						message.includes("WRONGPASS") ||
						message.includes("NOAUTH") ||
						message.includes("invalid username-password pair") ||
						message.includes("ERR AUTH") ||
						code === "WRONGPASS"
					) {
						return new Error("Redis authentication failed. Check REDIS_PASSWORD.");
					}

					// Keep bounded retries for transient failures.
					if (retries >= 10) {
						return new Error("Redis reconnect retries exhausted.");
					}

					// Exponential backoff capped at 3s.
					const delayMs = Math.min(250 * 2 ** retries, 3000);
					return delayMs;
				},
			},
			password: password,
		});
		this.isConnected = false;

		this.Client.on("error", (err) => {
			console.log("Error " + err);
		});
	}

	connect = async () => {
		try {
			await logger("RedisClient connect", () => this.Client.connect());
		} catch (error) {
			throw error;
		}
		this.isConnected = true;
	};

	destroy = async () => {
		try {
			await this.Client.destroy();
		} catch (error) {
			throw error;
		}
		this.isConnected = false;
	};

	set = (key: string, value: string) => {
		return logger("RedisClient set", () => this.Client.set(key, value));
	};

	get = (key: string) => {
		return logger("RedisClient get", () => this.Client.get(key));
	};
}
