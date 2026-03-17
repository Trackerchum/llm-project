import { MongoClient } from "../../../clients/mongoClient";
import { ChatHistoryEntry, UserChatHistoryDocument } from "../../../types/db/mongo/chatHistory";

export const getUserChatHistories = async (mongoClient: MongoClient, userId: string): Promise<ChatHistoryEntry[]> => {
	const document = await mongoClient.findOne<UserChatHistoryDocument>(mongoClient.getChatHistoryCollectionName(), {
		_id: userId,
	});
	return document?.histories ?? [];
};
