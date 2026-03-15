import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserMethods } from "../../models/user";
import { Client } from "../../fetch";
import HorizontalSpacer from "../../components/horizontalSpacer";
import Form from "../../components/form/Form";
import TextInput from "../../components/form/textInput";
import "./LoginPage.scss";
import { useAuth } from "../../globalProvider";
import { useNotifications } from "../../globalProvider/GlobalProvider";
import { Guid } from "../../helpers/Guid";

const LoginPage = () => {
	const navigate = useNavigate();
	const { setUser } = useAuth();
	const { addNotification } = useNotifications();

	const [localUser, setLocalUser] = useState<User>(UserMethods.createWithDefaultProps());
	const [emailError, setEmailError] = useState<string>("");
	const [passwordError, setPasswordError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const userClient = new Client("/api/user");

	const updateUser = (propName: keyof User, newValue: string) => {
		let newUser: User = { ...localUser };
		newUser[propName] = newValue.trim();
		setLocalUser(newUser);
	};

	const onSubmit = async () => {
		if (UserMethods.fieldsValidForLogin(localUser)) {
			setLoading(true);
			const response = await userClient.post<User>("/login", localUser);

			if (!response.isError) {
				setUser(response.data).then(() => {
					setLoading(false);
					navigate("/");
				});
			} else {
				setLoading(false);
				addNotification({
					id: Guid.NewGuid(),
					text: `There was an issue logging in: ${response.error.toString()}`,
					type: "Error"
				});
			}
		}
	};

	return (
		<div className="loginPage page">
			<h1>Login</h1>
			<HorizontalSpacer />
			<Form
				submitText="Login"
				onSubmit={onSubmit}
				submitDisabled={!UserMethods.fieldsValidForLogin(localUser)}
				loading={loading}
			>
				<>
					<TextInput
						value={localUser.email}
						onChange={(newValue) => updateUser("email", newValue)}
						name="email"
						labelText="*Email:"
						onBlur={() => setEmailError(UserMethods.getEmailError(localUser))}
						errorText={emailError}
					/>
					<TextInput
						value={localUser.password ?? ""}
						onChange={(newValue) => updateUser("password", newValue)}
						name="password"
						labelText="*Password:"
						type="password"
						onBlur={() => setPasswordError(UserMethods.getPasswordError(localUser, true))}
						errorText={passwordError}
					/>
				</>
			</Form>
			<HorizontalSpacer />
			<p>
				Don't have an account? <a href={"/register"}>Register</a>.
			</p>
		</div>
	);
};

export default LoginPage;
