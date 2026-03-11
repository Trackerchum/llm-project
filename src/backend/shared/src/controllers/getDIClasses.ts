import { OllamaClient } from "../clients/ollamaClient";
import { MongoClient } from "../clients/mongoClient";
import { RedisClient } from "../clients/redisClient";
import { DependencyInjectedClasses } from "./BaseController";

const getDIClasses = (config: {
	redis: { hostname: string; port: number; password: string };
	mongo: { url: string };
}): DependencyInjectedClasses => {
	const redisClient = new RedisClient(config.redis.hostname, config.redis.port, config.redis.password);
	const mongoClient = new MongoClient(config.mongo.url);
	const ollamaClient = new OllamaClient();

	return {
		redisClient,
		mongoClient,
		ollamaClient,
	};
};

export { getDIClasses };
