import "./Form.scss";
import Button from "../button";
import { JSX } from "react";

interface Props {
	readonly children: JSX.Element;
	readonly submitText: string;
	readonly onSubmit: () => void | Promise<void>;
	readonly submitDisabled?: boolean;
	readonly loading?: boolean;
}

const Form = ({ children, submitText, onSubmit, submitDisabled, loading }: Props) => {
	return (
		<form className="form">
			{children}
			<Button text={submitText} onSubmit={onSubmit} disabled={submitDisabled || loading} loading={loading} />
		</form>
	);
};

export default Form;
