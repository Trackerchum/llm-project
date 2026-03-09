import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, UserMethods } from "../../models/user";
import { Client } from "../../fetch";
import HorizontalSpacer from "../../components/horizontalSpacer";
import Form from "../../components/form/Form";
import TextInput from "../../components/form/textInput";

const LoginPage = () => {
	const navigate = useNavigate();

	const [localUser, setLocalUser] = useState<User>(UserMethods.createWithDefaultProps(true));
	const [emailError, setEmailError] = useState<string>("");
	const [passwordError, setPasswordError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const client = new Client("/api");

	const updateUser = (propName: keyof User, newValue: string) => {
		let newUser: User = { ...localUser };
		newUser[propName] = newValue.trim();
		setLocalUser(newUser);
	};

	const onSubmit = async () => {
		if (UserMethods.fieldsValidForLogin(localUser)) {
			setLoading(true);
			const response = await client.post<User>("/user/login", localUser);

			if (!response.isError) {
				// TODO set user to local storage/state
				setLoading(false);
				navigate("/");
			} else {
				// TODO handle error
				setLoading(false);
			}
		}
	};

	return (
		<div className="loginPage">
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
						onChange={(propName, newValue) => updateUser(propName as keyof User, newValue)}
						propName="email"
						labelText="*Email:"
						onBlur={() => setEmailError(UserMethods.getEmailError(localUser))}
						errorText={emailError}
					/>
					<TextInput
						value={localUser.password ?? ""}
						onChange={(propName, newValue) => updateUser(propName as keyof User, newValue)}
						propName="password"
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
