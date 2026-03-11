import { useEffect, useState } from "react";
import Button from "../../components/button";
import { Client } from "../../fetch";
import "./ChatPage.scss";
import TextInput from "../../components/form/textInput";
import { useAuth } from "../../globalProvider";
import LoadingText from "../../components/loadingText";

const chatClient = new Client("/api/chat");

// TODO share type with backend ChatController
type ChatHistoriesResponse = {
	ok: true;
	userId: string;
	chatHistories: Array<{
		id: string;
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
	const [chatHistory, setChatHistory] = useState<
		Array<{
			host: "user" | "assistant";
			text: string;
		}>
	>([]);

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
				if (response.data.chatHistories?.[0]) {
					const histories = response.data.chatHistories[0].messages
						.filter((message) => message.role === "assistant" || message.role === "user")
						.map((message) => ({
							host: message.role as "user" | "assistant",
							text: message.content,
						}));
					if (histories) {
						setChatHistory(histories);
					}
				}
				setIsFetchingChatHistory(false);
			});
		}
	}, [user]);

	const submitPrompt = () => {
		if (!promptText) {
			window.alert("Prompt text mustn't be blank");
			return;
		}
		if (!user?.id) {
			window.alert("You must be signed in");
			return;
		}
		setChatHistory((prev) => [...prev, { host: "user", text: promptText }]);
		setIsSubmittingPrompt(true);
		setPromptText("");

		chatClient.post<{ response: string }>("", { prompt: promptText, userId: user.id }).then((response) => {
			setIsSubmittingPrompt(false);
			if (response.isError) {
				setChatHistory((prev) => [...prev, { host: "assistant", text: `Error: ${response.error}` }]);
				return;
			}
			setChatHistory((prev) => [...prev, { host: "assistant", text: response.data.response }]);
		});
	};

	return (
		<div className="chatPage">
			{isFetchingChatHistory ? (
				<LoadingText text="Fetching chat history" />
			) : (
				<>
					<h1>Chat</h1>
					<div className="chatWindow">
						{chatHistory.length !== 0 && (
							<div className="chat">
								{chatHistory.map((message, n) => (
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
	);
};

export default HomePage;
