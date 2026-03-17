import {
	Db,
	Document,
	Filter,
	MongoClient as MongoNativeClient,
	OptionalUnlessRequiredId,
	UpdateFilter,
	UpdateOptions,
} from "mongodb";
import { logger } from "../../logging";

export class MongoClient {
	private Client: MongoNativeClient;
	private database: Db | null;
	private connectionString: string;
	private defaultDbName?: string;
	private chatHistoryCollectionName = "chatHistories";
	#isConnected: boolean;

	constructor(url: string, defaultDbName?: string) {
		this.connectionString = url;
		this.Client = new MongoNativeClient(url);
		this.database = null;
		this.defaultDbName = defaultDbName;
		this.#isConnected = false;
	}

	getChatHistoryCollectionName = () => this.chatHistoryCollectionName;

	isConnected = (): boolean => this.#isConnected;

	connect = async () => {
		try {
			await logger("MongoClient connect", () => this.Client.connect());
			const db = this.getDatabase();
			await logger("MongoClient ping", () => db.command({ ping: 1 }));
		} catch (error) {
			throw error;
		}
		this.#isConnected = true;
	};

	destroy = async () => {
		try {
			await logger("MongoClient close", () => this.Client.close());
		} catch (error) {
			throw error;
		}
		this.database = null;
		this.#isConnected = false;
	};

	// Convenience method similar to Redis set/get for key-value style storage.
	set = async <T>(collectionName: string, key: string, value: T) => {
		const collection = this.getDatabase().collection<{ _id: string; value: T }>(collectionName);
		return logger("MongoClient set", () =>
			collection.updateOne({ _id: key }, { $set: { value } }, { upsert: true }),
		);
	};

	get = async <T>(collectionName: string, key: string): Promise<T | null> => {
		const collection = this.getDatabase().collection<{ _id: string; value: T }>(collectionName);
		const document = await logger("MongoClient get", () => collection.findOne({ _id: key }));
		return document?.value ?? null;
	};

	insertOne = <T extends Document>(collectionName: string, document: OptionalUnlessRequiredId<T>) => {
		const collection = this.getDatabase().collection<T>(collectionName);
		return logger("MongoClient insertOne", () => collection.insertOne(document));
	};

	findOne = <T extends Document>(collectionName: string, filter: Filter<T>) => {
		const collection = this.getDatabase().collection<T>(collectionName);
		return logger("MongoClient findOne", () => collection.findOne(filter));
	};

	updateOne = <T extends Document>(
		collectionName: string,
		filter: Filter<T>,
		update: UpdateFilter<T>,
		options?: UpdateOptions,
	) => {
		const collection = this.getDatabase().collection<T>(collectionName);
		return logger("MongoClient updateOne", () => collection.updateOne(filter, update, options));
	};

	deleteOne = <T extends Document>(collectionName: string, filter: Filter<T>) => {
		const collection = this.getDatabase().collection<T>(collectionName);
		return logger("MongoClient deleteOne", () => collection.deleteOne(filter));
	};

	private getDatabase = (): Db => {
		if (this.database) {
			return this.database;
		}

		const dbName = this.resolveDbName();
		this.database = this.Client.db(dbName);
		return this.database;
	};

	private resolveDbName = (): string => {
		if (this.defaultDbName) {
			return this.defaultDbName;
		}

		const path = new URL(this.connectionString).pathname.replace("/", "");
		if (!path) {
			throw new Error(
				"Mongo database name is missing. Set it in MONGO_URL or pass defaultDbName to MongoClient.",
			);
		}

		return path;
	};
}
