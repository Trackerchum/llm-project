import { RedisCommandArgument } from '@node-redis/client/dist/lib/commands';
import { createClient, RedisClientType } from 'redis';

export class RedisClient {
    private Client: RedisClientType;
    isConnected: boolean;

    constructor(host: string, port: number, password?: string) {
        this.Client = createClient({
            socket: {
                host: host,
                port: port
            },
            password: password
        });
        this.isConnected = false;

        this.Client.on('error', err => {
            console.log('Error ' + err);
        });
    }

    connect = async () => {
        try {
            await this.Client.connect();
        }
        catch (error) {
            throw error;
        }
        this.isConnected = true;
    };

    disconnect = async () => {
        try {
            await this.Client.disconnect();
        }
        catch (error) {
            throw error;
        }
        this.isConnected = false;
    }

    set = (key: RedisCommandArgument, value: string) => {
        return this.Client.set(key, value);
    }

    get = (key: RedisCommandArgument) => {
        return this.Client.get(key);
    }
}
