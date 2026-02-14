import { appName } from '../../helpers/constants';
import './Header.scss';

const Header = () => {

    return <header className='Header'>
        <div className='container'>
            <div className='navBar'>
                <a href="/">{appName}</a>
                <a href="/chat">Chat</a>
            </div>
            <div>
                <a href="/login">Login/sign up</a>
            </div>
        </div>
    </header>
}

export default Header;
