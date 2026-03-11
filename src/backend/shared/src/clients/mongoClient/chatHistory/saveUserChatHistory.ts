import { MongoClient } from "../../../clients/mongoClient";
import { ChatHistoryEntry, UserChatHistoryDocument } from "../../../types/db/mongo/chatHistory";

export const saveUserChatHistory = async (
	mongoClient: MongoClient,
	chatHistoryCollectionName: string,
	userId: string,
	chatHistory: ChatHistoryEntry,
) => {
	const updateResult = await mongoClient.updateOne<UserChatHistoryDocument>(
		chatHistoryCollectionName,
		{ _id: userId, "histories.id": chatHistory.id },
		{ $set: { "histories.$": chatHistory } as any },
	);

	if (updateResult.matchedCount > 0) {
		return;
	}

	await mongoClient.updateOne<UserChatHistoryDocument>(
		chatHistoryCollectionName,
		{ _id: userId },
		{ $push: { histories: chatHistory } },
		{ upsert: true },
	);
};
