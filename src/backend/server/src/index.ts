import express from "express";
import * as dotenv from "dotenv";
import { getDIClasses, setupControllers, setupGracefulShutdown } from "@Shared/controllers";
import { ChatController, ChatHistoryController, GenerateController, HomeController } from "./controllers";

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
	mongo: {
		url: process.env.MONGO_URL,
	},
});

Promise.all([diClasses.redisClient.connect(), diClasses.mongoClient.connect()])
	.then(() => {
		setupControllers(
			app,
			[
				new HomeController("/"),
				new ChatController("/chat"),
				new ChatHistoryController("/chatHistory"),
				new GenerateController("/generate")
			],
			diClasses,
		);

		const httpServer = app.listen(port, () => {
			console.log(`listening on port ${port}`);
		});
		setupGracefulShutdown(httpServer, diClasses);
	})
	.catch((error) => {
		console.error(`Error connecting to dependency clients: ${error}`);
	});
