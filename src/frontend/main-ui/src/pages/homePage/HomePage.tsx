import Button from '../../components/button';
import { Client } from '../../fetch';
import './HomePage.scss';

const client = new Client("/api");

const HomePage = () => {

    return <div className="homePage">
        <h1>Home</h1>
        <Button text='Submit Test' onSubmit={() => {
            client.get("/").then(response => console.log(response));
        }} />
    </div>
}

export default HomePage;