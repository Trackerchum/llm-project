import { MongoClient } from "../../../clients/mongoClient";
import { UserChatHistoryDocument } from "../../../types/db/mongo/chatHistory";

export const deleteUserChatHistory = async (mongoClient: MongoClient, userId: string, chatId: string) => {
	await mongoClient.updateOne<UserChatHistoryDocument>(
		mongoClient.getChatHistoryCollectionName(),
		{ _id: userId },
		{ $pull: { histories: { id: chatId } as any } },
	);
};
