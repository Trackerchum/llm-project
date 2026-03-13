import { useEffect, useState } from "react";
import Button from "../../components/button";
import { Client } from "../../fetch";
import "./ChatPage.scss";
import TextInput from "../../components/form/textInput";
import { useAuth } from "../../globalProvider";
import LoadingText from "../../components/loadingText";
import { ChatHistory, Message } from "../../types/chat";
import Sidebar from "../../components/sidebar";

const chatClient = new Client("/api/chat");
const newChatText = "New Chat";

// TODO share type with backend ChatController
type ChatHistoriesResponse = {
	ok: true;
	userId: string;
	chatHistories: Array<{
		id: string;
		// TODO assign on server
		name: string;
		messages: Array<{
			role: "system" | "user" | "assistant" | "tool";
			content: string;
			tool_name?: string;
		}>;
		tools: unknown[];
	}>;
};

const HomePage = () => {
	const { user } = useAuth();

	const [isFetchingChatHistory, setIsFetchingChatHistory] = useState(false);
	const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
	const [promptText, setPromptText] = useState("");
	const [chatHistories, setChatHistories] = useState<Array<ChatHistory>>([]);
	const [activeChatId, setActiveChatId] = useState("");

	useEffect(() => {
		if (user?.id) {
			setIsFetchingChatHistory(true);
			chatClient.get<ChatHistoriesResponse>(`/histories/${user?.id}`).then((response) => {
				if (response.isError) {
					// TODO handle error properly
					console.log(response.error);
					setIsFetchingChatHistory(false);
					return;
				}

				if (response.data.chatHistories?.length > 0) {
					const histories = response.data.chatHistories.map((chatHistory) => ({
						id: chatHistory.id,
						name: chatHistory.name ?? chatHistory.id,
						messages: chatHistory.messages
							.filter((message) => message.role === "assistant" || message.role === "user")
							.map((message) => ({
								host: message.role as "user" | "assistant",
								text: message.content,
							})),
					}));
					if (histories && histories.length > 0) {
						setChatHistories(histories);
						setActiveChatId(histories[0].id);
					} else {
						const newChat: ChatHistory = {
							id: "",
							name: newChatText,
							messages: [],
						};
						setChatHistories([newChat]);
						setActiveChatId(newChat.id);
					}
				}
				setIsFetchingChatHistory(false);
			});
		}
	}, [user]);

	const updateChatHistoryImmutable = (
		previousState: ChatHistory[],
		chatId: string,
		newMessage: Message,
		newChatId?: string,
	): ChatHistory[] => {
		return previousState.map((chatHistory) => {
			if (chatHistory.id !== chatId) {
				return chatHistory;
			}

			return {
				...chatHistory,
				id: newChatId ? newChatId : chatHistory.id,
				// TODO fix name
				name: newChatId ? newChatId : chatHistory.name,
				messages: [...chatHistory.messages, newMessage],
			};
		});
	};

	const submitPrompt = () => {
		if (!promptText) {
			window.alert("Prompt text mustn't be blank");
			return;
		}
		if (!user?.id) {
			window.alert("You must be signed in");
			return;
		}
		setChatHistories((prev) => updateChatHistoryImmutable(prev, activeChatId, { host: "user", text: promptText }));
		setIsSubmittingPrompt(true);
		setPromptText("");

		chatClient
			.post<{
				response: string;
				chatId: string;
			}>("", { prompt: promptText, userId: user.id, chatId: activeChatId })
			.then((response) => {
				setIsSubmittingPrompt(false);
				if (response.isError) {
					// TODO handle error
					return;
				}
				setChatHistories((prev) =>
					updateChatHistoryImmutable(
						prev,
						activeChatId,
						{ host: "assistant", text: response.data.response },
						response.data.chatId,
					),
				);
				setActiveChatId(response.data.chatId);
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
							<li
								key={chatHistory.id}
								className={chatHistory.id === activeChatId ? "active" : ""}
								onClick={() => setActiveChatId(chatHistory.id)}
							>
								{chatHistory.name ?? chatHistory.id ?? newChatText}
							</li>
						))}
						{!!!chatHistories.find((chatHistory) => chatHistory.id === "") && (
							<li
								onClick={() => {
									const chatHistory: ChatHistory = {
										id: "",
										name: newChatText,
										messages: [],
									};
									setChatHistories((prev) => [...prev, chatHistory]);
									setActiveChatId(chatHistory.id);
								}}
							>{`+ ${newChatText}`}</li>
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
										{chatHistories
											.find((history) => history.id === activeChatId)
											?.messages.map((message, n) => (
												<p key={n} className={message.host}>
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

export default HomePage;
