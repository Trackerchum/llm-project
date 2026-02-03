import express from 'express';
import * as dotenv from 'dotenv';
import { RedisClient } from '@Shared/models/redisClient';
import { DependencyInjectedClasses, setupControllers } from '@Shared/controllers';
import { HomeController, UserController } from './controllers';

dotenv.config();

const app = express();
app.use(express.json());

const port = parseInt(process.env.API_PORT, 10);

const client = new RedisClient(
    process.env.REDIS_HOSTNAME,
    parseInt(process.env.REDIS_PORT, 10),
    process.env.REDIS_PASSWORD
);

const diClasses: DependencyInjectedClasses = {
    client,
};

client
    .connect()
    .then(() => {
        setupControllers(app, [new HomeController('/'), new UserController('/user')], diClasses);

        app.listen(port, () => {
            console.log(`listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error(`Error connecting to redis client: ${error}`);
    });
