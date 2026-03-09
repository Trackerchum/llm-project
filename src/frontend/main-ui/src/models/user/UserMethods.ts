import { User } from './User';
import { EmailHelpers } from "../../helpers/EmailHelpers";

const blankFieldErrorMessage = "*This field is required";

export class UserMethods {
    static createWithDefaultProps: (login?: boolean) => User = (login = false) => {
        let user = {
            email: "",
            password: ""
        };
        if (!login) {
            user = Object.assign(user, {
                firstName: "",
                lastName: "",
                confirmPassword: ""
            });
        }
        return user;
    }

    static fieldsValidForLogin = (user: User) => !UserMethods.getEmailError(user) &&
        !UserMethods.getPasswordError(user, true);

    static fieldsValidForRegister = (user: User) => !UserMethods.getFirstNameError(user) &&
        !UserMethods.getLastNameError(user) &&
        !UserMethods.getEmailError(user) &&
        !UserMethods.getPasswordError(user) &&
        !UserMethods.getConfirmPasswordError(user);

    static getFirstNameError = (user: User) => {
        if (!user.firstName?.trim()) {
            return blankFieldErrorMessage;
        }
        return "";
    }

    static getLastNameError = (user: User) => {
        if (!user.lastName?.trim()) {
            return blankFieldErrorMessage;
        }
        return "";
    }

    static getEmailError = (user: User) => {
        if (!user.email.trim()) {
            return blankFieldErrorMessage;
        }
        if (!EmailHelpers.isValid(user.email)) {
            return "*This is not a valid email address";
        }
        return "";
    }

    static getPasswordError = (user: User, login = false) => {
        if (!user.password?.trim()) {
            return blankFieldErrorMessage;
        }
        if (!login && !/^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{7,}$/.test(user.password)) {
            return "*Password must contain at least one uppercase letter, one number and at least 7 characters";
        }
        return "";
    }

    static getConfirmPasswordError = (user: User) => {
        if (!user.confirmPassword?.trim()) {
            return blankFieldErrorMessage;
        }
        if (user.password !== user.confirmPassword) {
            return "*Passwords do not match";
        }
        return "";
    }
}
