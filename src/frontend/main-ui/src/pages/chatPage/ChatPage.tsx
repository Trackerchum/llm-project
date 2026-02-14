import { useState } from 'react';
import Button from '../../components/button';
import { Client } from '../../fetch';
import './ChatPage.scss';
import TextInput from '../../components/form';

const client = new Client("/api");

const HomePage = () => {

    const [isLoading, setLoading] = useState(false);
    const [promptText, setPromptText] = useState("");
    const [chatHistory, setChatHistory] = useState<Array<{
        host: "prompt" | "reply",
        text: string
    }>>([]);

    const submitPrompt = () => {
        if (!promptText) {
            window.alert("Prompt text mustn't be blank");
            return;
        }
        setChatHistory(prev => [...prev, { host: "prompt", text: promptText }]);
        setLoading(true);
        setPromptText("");
        client.post<{response: string}>("/", { prompt: promptText })
            .then(response => {
                setLoading(false);
                if (response.isError) {
                    setChatHistory(prev => [
                        ...prev,
                        { host: "reply", text: `Error: ${response.error}` }
                    ]);
                    return;
                }
                setChatHistory(prev => [...prev, { host: "reply", text: response.data.response }]);
            });
    }


    return <div className="chatPage">
        <h1>Chat page</h1>
        <div className='chatWindow'>
            {chatHistory.length !== 0 && <div className='chat' >
                {chatHistory.map((message, n) => <p key={n} className={message.host}>{message.text}</p>)}
            </div>}
            <TextInput
                labelText='Prompt: '
                propName="promptText"
                value={promptText}
                onChange={(_, newValue: string) => { setPromptText(newValue) }}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        submitPrompt();
                    }
                }}
            />
        </div>
        <Button text='Submit Prompt'
            loading={isLoading}
            onSubmit={submitPrompt}/>
    </div>
}

export default HomePage;