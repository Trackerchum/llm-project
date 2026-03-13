import { useEffect, useState } from "react";
import Button from "../../components/button";
import { Client } from "../../fetch";
import "./ChatPage.scss";
import TextInput from "../../components/form/textInput";
import { useAuth } from "../../globalProvider";
import LoadingText from "../../components/loadingText";
import { ChatHistory, Message } from "../../types/chat";
import Sidebar from "../../components/sidebar";
import { generateHash } from "../../helpers/generateHash";

const chatClient = new Client("/api/chat");
const newChatText = "New Chat";

// TODO share type with backend ChatController
type ChatHistoriesResponse = {
	ok: true;
	userId: string;
	chatHistories: Array<{
		id: string;
		name: string;
		messages: Array<{
			role: "system" | "user" | "assistant" | "tool";
			content: string;
			tool_name?: string;
		}>;
		tools: unknown[];
	}>;
};

const ChatPage = () => {
	const { user } = useAuth();

	const [isFetchingChatHistory, setIsFetchingChatHistory] = useState(false);
	const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
	const [promptText, setPromptText] = useState("");
	const [chatHistories, setChatHistories] = useState<Array<ChatHistory>>([]);
	const [activeChatId, setActiveChatId] = useState("");

	useEffect(() => {
		const abortController = new AbortController();

		if (!user?.id) {
			setIsFetchingChatHistory(false);
			return () => {
				abortController.abort();
			};
		}

		const fetchChatHistory = async () => {
			setIsFetchingChatHistory(true);
			try {
				const response = await chatClient.get<ChatHistoriesResponse>(`/histories/${user.id}`, {
					signal: abortController.signal,
				});

				if (response.isError) {
					// TODO handle error properly
					console.log(response.error);
					return;
				}

				if (response.data.chatHistories?.length > 0) {
					const histories = response.data.chatHistories.map((chatHistory) => ({
						id: chatHistory.id,
						name: chatHistory.name,
						messages: chatHistory.messages
							.filter((message) => message.role === "assistant" || message.role === "user")
							.map((message) => ({
								host: message.role as "user" | "assistant",
								text: message.content,
							})),
					}));
					if (histories.length > 0) {
						setActiveChatId(histories[0].id);
						setChatHistories(histories);
					} else {
						const newChat: ChatHistory = {
							id: "",
							name: newChatText,
							messages: [],
						};
						setActiveChatId(newChat.id);
						setChatHistories([newChat]);
					}
				}
			} catch (error) {
				if (abortController.signal.aborted) {
					return;
				}
				// TODO handle error properly
				console.log(error);
			} finally {
				if (!abortController.signal.aborted) {
					setIsFetchingChatHistory(false);
				}
			}
		};

		void fetchChatHistory();

		return () => {
			abortController.abort();
		};
	}, [user?.id]);

	const updateChatHistoryImmutable = (params: {
		previousState: ChatHistory[],
		newMessage: Message,
		chatId: string,
		name?: string,
		newChatId?: string,

	}): ChatHistory[] => {
		return params.previousState.map((chatHistory) => {
			if (chatHistory.id !== params.chatId) {
				return chatHistory;
			}

			return {
				...chatHistory,
				id: params.newChatId ? params.newChatId : chatHistory.id,
				name: params.name ?? chatHistory.name,
				messages: [...chatHistory.messages, params.newMessage],
			};
		});
	};

	const submitPrompt = () => {
		if (isSubmittingPrompt) {
			return;
		}
		if (!promptText) {
			window.alert("Prompt text mustn't be blank");
			return;
		}
		if (!user?.id) {
			window.alert("You must be signed in");
			return;
		}

		setChatHistories((prev) => updateChatHistoryImmutable({
			previousState: prev,
			chatId: activeChatId,
			newMessage: {
				host: "user",
				text: promptText
			}
		}));
		setIsSubmittingPrompt(true);
		setPromptText("");

		chatClient
			.post<{
				response: string;
				chatId: string;
				name: string;
			}>("", { prompt: promptText, userId: user.id, chatId: activeChatId })
			.then((response) => {
				setIsSubmittingPrompt(false);
				if (response.isError) {
					// TODO handle error
					return;
				}
				setChatHistories((prev) =>
					updateChatHistoryImmutable({
						previousState: prev,
						chatId: activeChatId,
						newMessage: { host: "assistant", text: response.data.response },
						newChatId: response.data.chatId,
						name: response.data.name
					}),
				);
				setActiveChatId(response.data.chatId);
			}).catch(error => {
				// TODO handle error properly
				console.log(error);
				setIsSubmittingPrompt(false);
			});
	};

	const activeChat = chatHistories.find((chatHistory) => chatHistory.id === activeChatId);

	return (
		<Sidebar
			children={
				isFetchingChatHistory ? (
					<LoadingText text="Fetching chat history" />
				) : (
					<ul className="chatList">
						{chatHistories.map((chatHistory) => (
							<li key={chatHistory.id}>
								<button
									type="button"
									className={chatHistory.id === activeChatId ? "active" : ""}
									onClick={() => setActiveChatId(chatHistory.id)}
								>
									{chatHistory.name ?? chatHistory.id ?? newChatText}
								</button>
							</li>
						))}
						{!chatHistories.some(history => history.id === "") && (
							<li>
								<button
									type="button"
									onClick={() => {
										const chatHistory: ChatHistory = {
											id: "",
											name: newChatText,
											messages: [],
										};
										setActiveChatId(chatHistory.id);
										setChatHistories((prev) => [...prev, chatHistory]);
									}}
								>{`+ ${newChatText}`}</button>
							</li>
						)}
					</ul>
				)
			}
			page={
				<div className="chatPage">
					{isFetchingChatHistory ? (
						<LoadingText text="Fetching chat history" />
					) : (
						<>
							<h1>Chat</h1>
							<div className="chatWindow">
								{activeChat && activeChat.messages.length > 0 && (
									<div className="chat">
										{activeChat.messages.map((message, n) => (
											<p key={generateHash(activeChat.name + message.text + message.host + n)} className={message.host}>
												{message.text}
											</p>
										))}
									</div>
								)}
								<TextInput
									labelText="Prompt: "
									name="promptText"
									value={promptText}
									onChange={(newValue: string) => {
										setPromptText(newValue);
									}}
									onKeyDown={(e: React.KeyboardEvent) => {
										if (e.key === "Enter") {
											e.preventDefault();
											submitPrompt();
										}
									}}
								/>
							</div>
							<Button text="Submit Prompt" loading={isSubmittingPrompt} onSubmit={submitPrompt} />
						</>
					)}
				</div>
			}
		/>
	);
};

export default ChatPage;
