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

// TODO share type with backend ChatController
type ChatHistoriesResponse = {
	ok: true;
	userId: string;
	chatHistories: Array<{
		id: string;
		// TODO assign on server
		name: string,
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
				// TODO support mutliple chat histories
				if (response.data.chatHistories?.length > 0) {
					setActiveChatId(response.data.chatHistories[0].id);
					const histories = response.data.chatHistories.map(chatHistory => ({
						id: chatHistory.id,
						name: chatHistory.name ?? chatHistory.id,
						messages: chatHistory.messages
							.filter((message) => message.role === "assistant" || message.role === "user")
							.map((message) => ({
								host: message.role as "user" | "assistant",
								text: message.content,
							}))
					}))
					if (histories) {
						setChatHistories(histories);
					}
				}
				setIsFetchingChatHistory(false);
			});
		}
	}, [user]);

	const updateChatHistoryImmutable = (previousState: ChatHistory[], chatId: string, newMessage: Message): ChatHistory[] => {
		return previousState.map((chatHistory) => {
			if (chatHistory.id !== chatId) {
				return chatHistory;
			}

			return {
				...chatHistory,
				messages: [...chatHistory.messages, newMessage],
			};
		});
	}

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

		chatClient.post<{ response: string }>("", { prompt: promptText, userId: user.id }).then((response) => {
			setIsSubmittingPrompt(false);
			if (response.isError) {
				// TODO handle error
				return;
			}
			setChatHistories((prev) => updateChatHistoryImmutable(prev, activeChatId, { host: "assistant", text: response.data.response }));
		});
	};

	return (
		<Sidebar
			children={isFetchingChatHistory ? (
				<LoadingText text="Fetching chat history" />
			) : (<ul className="chatList">{chatHistories.map(chatHistory => (
				<li key={chatHistory.id} className={chatHistory.id === activeChatId ? "active" : ""}>
					{chatHistory.name ?? chatHistory.id ?? "New Chat"}
				</li>)
			)}
				{/* <li onClick={() => {}}>+ New Chat</li> */}
			</ul>)}
			page={<div className="chatPage">
				{isFetchingChatHistory ? (
					<LoadingText text="Fetching chat history" />
				) : (
					<>
						<h1>Chat</h1>
						<div className="chatWindow">
							{chatHistories.length !== 0 && (
								<div className="chat">
									{chatHistories[0].messages.map((message, n) => (
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
			</div>} />
	);
};

export default HomePage;
