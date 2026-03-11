import { useState } from "react";
import { User, UserMethods } from "../../models/user";
import HorizontalSpacer from "../../components/horizontalSpacer";
import Form from "../../components/form/Form";
import TextInput from "../../components/form/textInput";
import "./RegisterPage.scss";
import { useNavigate } from "react-router-dom";
import { Client } from "../../fetch";

const RegisterPage = () => {
	const navigate = useNavigate();

	const [user, setUser] = useState<User>(UserMethods.createWithDefaultProps(true));
	const [firstNameError, setFirstNameError] = useState<string>("");
	const [lastNameError, setLastNameError] = useState<string>("");
	const [emailError, setEmailError] = useState<string>("");
	const [passwordError, setPasswordError] = useState<string>("");
	const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);

	const client = new Client("/api/user");

	const updateUser = (propName: keyof User, newValue: string) => {
		let newUser = { ...user };
		newUser[propName] = newValue.trim();
		setUser(newUser);
	};

	const onSubmit = async () => {
		if (UserMethods.fieldsValidForRegister(user)) {
			setLoading(true);
			let postUser = { ...user };
			delete postUser.confirmPassword;

			const response = await client.post<User>("/register", postUser);

			if (!response.isError) {
				setLoading(false);
				navigate("/login");
			} else {
				// TODO handle errors - invalid login, user already exists etc...
				setLoading(false);
			}
		}
	};

	return (
		<div className="registerPage">
			<h1>Register</h1>
			<HorizontalSpacer />
			<Form
				submitText="Register"
				onSubmit={onSubmit}
				submitDisabled={!UserMethods.fieldsValidForRegister(user)}
				loading={loading}
			>
				<>
					<TextInput
						value={user.firstName ?? ""}
						onChange={(newValue: string) => updateUser("firstName", newValue)}
						name="firstName"
						labelText="*First name:"
						onBlur={() => setFirstNameError(UserMethods.getFirstNameError(user))}
						errorText={firstNameError}
					/>
					<TextInput
						value={user.lastName ?? ""}
						onChange={(newValue: string) => updateUser("lastName", newValue)}
						name="lastName"
						labelText="*Last name:"
						onBlur={() => setLastNameError(UserMethods.getLastNameError(user))}
						errorText={lastNameError}
					/>
					<TextInput
						value={user.email}
						onChange={(newValue: string) => updateUser("email", newValue)}
						name="email"
						labelText="*Email:"
						onBlur={() => setEmailError(UserMethods.getEmailError(user))}
						errorText={emailError}
					/>
					<TextInput
						value={user.password ?? ""}
						onChange={(newValue: string) => updateUser("password", newValue)}
						name="password"
						labelText="*Password:"
						type="password"
						onBlur={() => {
							setPasswordError(UserMethods.getPasswordError(user));
							if (user.confirmPassword) {
								setConfirmPasswordError(UserMethods.getConfirmPasswordError(user));
							}
						}}
						errorText={passwordError}
					/>
					<TextInput
						value={user.confirmPassword ?? ""}
						onChange={(newValue: string) => updateUser("confirmPassword", newValue)}
						name="confirmPassword"
						labelText="*Confirm password:"
						type="password"
						onBlur={() => setConfirmPasswordError(UserMethods.getConfirmPasswordError(user))}
						errorText={confirmPasswordError}
					/>
				</>
			</Form>
			<HorizontalSpacer />
			<p>
				Already have an account? <a href={"/login"}>Login</a>.
			</p>
		</div>
	);
};

export default RegisterPage;
