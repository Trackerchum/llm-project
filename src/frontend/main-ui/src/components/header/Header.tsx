import { appName } from '../../helpers/constants';
import './Header.scss';

const Header = () => {

    return <header className='Header'>
        <div className='container h-full flex justify-between'>
            <div>
                <a href="/">{appName}</a>
            </div>
            <div>
                 <a href="/login">Login/sign up</a>
            </div>
        </div>
    </header>
}

export default Header;
