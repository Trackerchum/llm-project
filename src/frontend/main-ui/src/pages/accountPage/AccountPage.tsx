import { useNavigate } from "react-router-dom";
import { useAuth } from "../../globalProvider";
import HorizontalSpacer from "../../components/horizontalSpacer";
import "./AccountPage.scss";
import Button from "../../components/button";

const AccountPage = () => {
	const navigate = useNavigate();
	const { user, logoutUser } = useAuth();
	if (!user && typeof window !== "undefined") {
		navigate("/login");
	}

	return (
		<div className="accountPage">
			<h1>My Account</h1>
			<HorizontalSpacer />
			<div>
				<p>First name: {user?.firstName}</p>
				<p>Last name: {user?.lastName}</p>
				<p>Email: {user?.email}</p>
			</div>
			<HorizontalSpacer />
			<Button
				text="Logout"
				buttonType={"Cancel"}
				onSubmit={() => {
					logoutUser();
					navigate("/");
				}}
			/>
		</div>
	);
};

export default AccountPage;
