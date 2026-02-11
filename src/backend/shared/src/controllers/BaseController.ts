import { Express } from 'express';
import { RedisClient } from '../models/redisClient';
import { User } from '../models/user';

export interface DependencyInjectedClasses {
    client: RedisClient
}

export abstract class BaseController implements DependencyInjectedClasses {
    baseUrl: string;
    client: RedisClient;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    init = (app: Express, diClasses: DependencyInjectedClasses) => {
        this.client = diClasses.client;
        this.setupRoutes(app);
    }

    abstract setupRoutes: (app: Express) => void;

    getUser = async (email: string): Promise<User | null> => {
        const response = await this.client.get(email);
        if (typeof response === "string") {
            return JSON.parse(response);
        }
        return null;
    }
}
