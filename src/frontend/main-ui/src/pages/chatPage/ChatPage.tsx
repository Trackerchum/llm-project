import { useState } from 'react';
import Button from '../../components/button';
import { Client } from '../../fetch';
import './ChatPage.scss';
import TextInput from '../../components/form';

const client = new Client("/api");

const HomePage = () => {

    const [isLoading, setLoading] = useState(false);
    const [promptText, setPromptText] = useState("");


    return <div className="chatPage">
        <h1>Chat page</h1>
        <div className='chatWindow'>
            <div>
            
            </div>
            <TextInput
                labelText='Prompt: '
                propName="promptText"
                value={promptText}
                onChange={(_, newValue: string) => { setPromptText(newValue) }}
            />
        </div>
        <Button text='Submit Prompt'
            loading={isLoading}
            onSubmit={() => {
                if (!promptText) {
                    window.alert("Prompt text mustn't be blank");
                    return;
                }
                setLoading(true);
                client.post("/", { prompt: promptText })
                    .then(response => {
                        setLoading(false);
                        console.log(response);
                    });
            }}/>
    </div>
}

export default HomePage;