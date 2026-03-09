import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/homePage";
import ChatPage from "../pages/chatPage";
import MCPTestPage from "../pages/mcpTestPage";
import AccountPage from "../pages/accountPage";

const router = createBrowserRouter([
	{
		path: "/",
		errorElement: (
			<div>
				<h1>ERROR PAGE</h1>
			</div>
		),
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "chat", element: <ChatPage /> },
			{ path: "mcp", element: <MCPTestPage /> },
			{ path: "login", element: <AccountPage /> },
			{ path: "account", element: <AccountPage /> },
		],
	},
]);

export { router };
