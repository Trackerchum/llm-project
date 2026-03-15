import { useEffect, useRef, useState } from "react";
import { Client } from "../../fetch";
import "./ChatPage.scss";
import TextInput from "../../components/form/textInput";
import { useAuth, useNotifications } from "../../globalProvider";
import LoadingText from "../../components/loadingText";
import { ChatHistory, Message } from "../../types/chat";
import Sidebar from "../../components/sidebar";
import { generateHash } from "../../helpers/generateHash";
import { Guid } from "../../helpers/Guid";

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
	const { addNotification } = useNotifications();

	const [isFetchingChatHistory, setIsFetchingChatHistory] = useState(false);
	const [isSubmittingPrompt, setIsSubmittingPrompt] = useState(false);
	const [promptText, setPromptText] = useState("");
	const [chatHistories, setChatHistories] = useState<Array<ChatHistory>>([]);
	const [stateActiveChatId, setStateActiveChatId] = useState("");
	const chatContainerRef = useRef<HTMLDivElement | null>(null);

	const setActiveChatId = (chatId: string) => {
		window.localStorage.setItem("activeChatId", chatId);
		setStateActiveChatId(chatId);
	};

	useEffect(() => {
		const abortController = new AbortController();

		if (!user?.token) {
			setIsFetchingChatHistory(false);
			return () => {
				abortController.abort();
			};
		}

		const fetchChatHistory = async () => {
			setIsFetchingChatHistory(true);
			try {
				const response = await chatClient.get<ChatHistoriesResponse>("/histories", {
					signal: abortController.signal,
				});

				if (response.isError) {
					addNotification({
						id: Guid.NewGuid(),
						text: `Error fetching chat history: ${response.error.toString()}`,
						type: "Error",
					});
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
					setActiveChatId(window.localStorage.getItem("activeChatId") ?? histories[histories.length - 1].id);
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
			} catch (error) {
				if (abortController.signal.aborted) {
					return;
				}
				addNotification({
					id: Guid.NewGuid(),
					text: `Error fetching chat history: ${error}`,
					type: "Error",
				});
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
	}, [user?.token]);

	const updateChatHistoryImmutable = (params: {
		previousState: ChatHistory[];
		newMessage: Message;
		chatId: string;
		name?: string;
		newChatId?: string;
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
		if (!user?.id || !user?.token) {
			window.alert("You must be signed in");
			return;
		}

		setChatHistories((prev) =>
			updateChatHistoryImmutable({
				previousState: prev,
				chatId: stateActiveChatId,
				newMessage: {
					host: "user",
					text: promptText,
				},
			}),
		);
		setIsSubmittingPrompt(true);
		setPromptText("");

		chatClient
			.post<{
				response: string;
				chatId: string;
				name: string;
			}>("", { prompt: promptText, chatId: stateActiveChatId })
			.then((response) => {
				setIsSubmittingPrompt(false);
				if (response.isError) {
					addNotification({
						id: Guid.NewGuid(),
						text: `Error submitting prompt: ${response.error.toString()}`,
						type: "Error",
					});
					return;
				}
				setChatHistories((prev) =>
					updateChatHistoryImmutable({
						previousState: prev,
						chatId: stateActiveChatId,
						newMessage: { host: "assistant", text: response.data.response },
						newChatId: response.data.chatId,
						name: response.data.name,
					}),
				);
				setActiveChatId(response.data.chatId);
			})
			.catch((error) => {
				addNotification({
					id: Guid.NewGuid(),
					text: `Error submitting prompt: ${error}`,
					type: "Error",
				});
				setIsSubmittingPrompt(false);
			});
	};

	const activeChat = chatHistories.find((chatHistory) => chatHistory.id === stateActiveChatId);
	const activeMessageCount = activeChat?.messages.length ?? 0;
	const hasMessages = activeMessageCount > 0;

	useEffect(() => {
		if (!chatContainerRef.current) {
			return;
		}

		chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
	}, [stateActiveChatId, activeMessageCount, isSubmittingPrompt]);

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
									className={chatHistory.id === stateActiveChatId ? "active" : ""}
									onClick={() => setActiveChatId(chatHistory.id)}
								>
									{chatHistory.name ?? chatHistory.id ?? newChatText}
								</button>
							</li>
						))}
						{!chatHistories.some((history) => history.id === "") && (
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
				<div className="chatPage page">
					{isFetchingChatHistory ? (
						<LoadingText text="Fetching chat history" />
					) : (
						<>
							<div className={hasMessages ? "chatWindow" : "chatWindow empty"}>
								{hasMessages && (
									<div className="chat" ref={chatContainerRef}>
										{activeChat?.messages.map((message, n) => (
											<p
												key={generateHash(activeChat.name + message.text + message.host + n)}
												className={message.host}
											>
												{message.text}
											</p>
										))}
										{isSubmittingPrompt && (
											<p className="assistant loadingMessage">
												<LoadingText text="Assistant is thinking" />
											</p>
										)}
									</div>
								)}
								<div className={hasMessages ? "chatInputWrapper" : "chatInputWrapper centered"}>
									{!hasMessages && <h2>What can I help with?</h2>}
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
							</div>
						</>
					)}
				</div>
			}
		/>
	);
};

export default ChatPage;
