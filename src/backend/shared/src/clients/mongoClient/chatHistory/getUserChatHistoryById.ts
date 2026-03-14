import { MongoClient } from "../../../clients/mongoClient";
import { ChatHistoryEntry, UserChatHistoryDocument } from "../../../types/db/mongo/chatHistory";

export const getUserChatHistoryById = async (
	mongoClient: MongoClient,
	chatHistoryCollectionName: string,
	userId: string,
	chatId: string,
): Promise<ChatHistoryEntry | undefined> => {
	const document = await mongoClient.findOne<UserChatHistoryDocument>(chatHistoryCollectionName, {
		_id: userId,
		"histories.id": chatId,
	});

	return document?.histories.find((history) => history.id === chatId);
};
