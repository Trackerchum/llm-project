import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/homePage";
import ChatPage from "../pages/chatPage";
import MCPPage from "../pages/mcpPage";

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
			{ path: "mcp", element: <MCPPage /> },
		],
	},
]);

export { router };
