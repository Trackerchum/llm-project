import { MongoClient } from "../../../clients/mongoClient";
import { UserChatHistoryDocument } from "../../../types/db/mongo/chatHistory";

export const deleteUserChatHistory = async (
	mongoClient: MongoClient,
	chatHistoryCollectionName: string,
	userId: string,
	chatId: string,
) => {
	await mongoClient.updateOne<UserChatHistoryDocument>(
		chatHistoryCollectionName,
		{ _id: userId },
		{ $pull: { histories: { id: chatId } as any } },
	);
};
