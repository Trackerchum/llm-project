import { appName } from '../../helpers/sharedStrings';
import './Header.scss';

interface Props {

}

const Header = ({ }: Props) => {

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
