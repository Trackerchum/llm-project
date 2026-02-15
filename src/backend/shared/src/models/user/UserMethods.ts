import { User } from "./User";
import { EmailHelpers } from "../../helpers/EmailHelpers";

export class UserMethods {
	static fieldsValidForLogin = (user: User) =>
		UserMethods.emailIsValid(user) && UserMethods.passwordIsValid(user, true);

	static fieldsValidForRegister = (user: User) =>
		UserMethods.firstNameIsValid(user) &&
		UserMethods.lastNameIsValid(user) &&
		UserMethods.emailIsValid(user) &&
		UserMethods.passwordIsValid(user);

	static firstNameIsValid = (user: User) => !!user?.firstName?.trim();

	static lastNameIsValid = (user: User) => !!user?.lastName?.trim();

	static emailIsValid = (user: User) => !!user.email.trim() && EmailHelpers.isValid(user.email);

	static passwordIsValid = (user: User, isLogin = false) =>
		!!user.password && !(!isLogin && !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{7,}$/.test(user.password));

	static returnToBrowser = (user: User): User => {
		return {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			token: user.token,
		};
	};
}
