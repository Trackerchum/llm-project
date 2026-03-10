import { useAuth } from "../../globalProvider";
import { appName } from "../../helpers/constants";
import "./Header.scss";

const Header = () => {
	const { user } = useAuth();

	return (
		<header className="Header">
			<div className="container">
				<div className="navBar">
					<p>|</p>
					<a href="/">{appName}</a>
					<p>|</p>
					<a href="/chat">Chat</a>
					<p>|</p>
					<a href="/mcp">MCP test</a>
					<p>|</p>
				</div>
				<div>{user ? <a href="/account">Account</a> : <a href="/login">Login/sign up</a>}</div>
			</div>
		</header>
	);
};

export default Header;
