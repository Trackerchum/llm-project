import express from "express";
import * as dotenv from "dotenv";
import { getDIClasses, setupControllers } from "@Shared/controllers";
import { ChatController, GenerateController, HomeController } from "./controllers";

dotenv.config();

const app = express();
app.use(express.json());

const port = parseInt(process.env.API_PORT, 10);

const diClasses = getDIClasses({
	redis: {
		hostname: process.env.REDIS_HOSTNAME,
		port: parseInt(process.env.REDIS_PORT, 10),
		password: process.env.REDIS_PASSWORD,
	},
});

diClasses.redisClient
	.connect()
	.then(() => {
		setupControllers(
			app,
			[new HomeController("/"), new ChatController("/chat"), new GenerateController("/generate")],
			diClasses,
		);

		app.listen(port, () => {
			console.log(`listening on port ${port}`);
		});
	})
	.catch((error) => {
		console.error(`Error connecting to redis client: ${error}`);
	});
