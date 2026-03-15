import React from "react";
import Header from "./header";
import Footer from "./footer";
import "./App.scss";
import { RouterProvider } from "react-router-dom";
import { router } from "../router";
import NotificationCentre from "./notificationCentre";

const App = () => {
	return (
		<div className="App">
			<Header />
			<main className="container">
				<RouterProvider router={router} />
			</main>
			<NotificationCentre />
			<Footer />
		</div>
	);
};

export default App;
