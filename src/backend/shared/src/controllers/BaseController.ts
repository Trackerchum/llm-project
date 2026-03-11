import { Express } from "express";
import { RedisClient } from "../clients/redisClient";
import { User } from "../models/user";
import { OllamaClient } from "../clients/ollamaClient";
import { MongoClient } from "../clients/mongoClient";

export interface DependencyInjectedClasses {
	redisClient: RedisClient;
	mongoClient: MongoClient;
	ollamaClient: OllamaClient;
}

export abstract class BaseController implements DependencyInjectedClasses {
	baseUrl: string;
	redisClient: RedisClient;
	mongoClient: MongoClient;
	ollamaClient: OllamaClient;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	init = (app: Express, diClasses: DependencyInjectedClasses) => {
		this.redisClient = diClasses.redisClient;
		this.mongoClient = diClasses.mongoClient;
		this.ollamaClient = diClasses.ollamaClient;
		this.setupRoutes(app);
	};

	abstract setupRoutes: (app: Express) => void;

	getUser = async (email: string): Promise<User | null> => {
		const response = await this.redisClient.get(email);
		if (typeof response === "string") {
			return JSON.parse(response);
		}
		return null;
	};
}
