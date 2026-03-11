import { MongoClient } from "../../../clients/mongoClient";
import { ChatHistoryEntry, UserChatHistoryDocument } from "../../../types/db/mongo/chatHistory";

export const getUserChatHistories = async (
	mongoClient: MongoClient,
	chatHistoryCollectionName: string,
	userId: string,
): Promise<ChatHistoryEntry[]> => {
	const document = await mongoClient.findOne<UserChatHistoryDocument>(chatHistoryCollectionName, {
		_id: userId,
	});
	return document?.histories ?? [];
};
