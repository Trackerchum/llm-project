import { OllamaClient } from "../clients/ollamaClient";
import { RedisClient } from "../clients/redisClient";
import { DependencyInjectedClasses } from "./BaseController";


const getDIClasses = (config: { redis: { hostname: string, port: number, password: string } }): DependencyInjectedClasses => {
    const redisClient = new RedisClient(
        config.redis.hostname,
        config.redis.port,
        config.redis.password,
    );

    const ollamaClient = new OllamaClient();

    return {
        redisClient,
        ollamaClient,
    };
}

export { getDIClasses }