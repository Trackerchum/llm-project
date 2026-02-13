import { useState } from 'react';
import Button from '../../components/button';
import { Client } from '../../fetch';
import './HomePage.scss';

const client = new Client("/api");

const HomePage = () => {

    const [isLoading, setLoading] = useState(false)

    return <div className="homePage">
        <h1>Home</h1>
        <Button text='Submit Test'
            loading={isLoading}
            onSubmit={() => {
                setLoading(true);
                client.get("/").then(response => {
                    setLoading(false);
                    console.log(response);
                });
            }}/>
    </div>
}

export default HomePage;