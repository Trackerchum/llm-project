import LoadingDots from "../loadingText";
import "./Button.scss";

export type ButtonType = "Submit" | "Cancel";

interface Props {
	readonly text: string;
	readonly buttonType?: ButtonType;
	readonly onSubmit: () => void | Promise<void>;
	readonly disabled?: boolean;
	readonly className?: string;
	readonly loading?: boolean;
}

const Button = ({ text, buttonType = "Submit", onSubmit, disabled = false, className, loading }: Props) => {
	return (
		<button
			onClick={
				disabled || loading
					? undefined
					: (e) => {
							e.preventDefault();
							onSubmit();
						}
			}
			disabled={disabled || loading}
			className={"Button " + buttonType}
		>
			<>{loading ? <LoadingDots /> : text}</>
		</button>
	);
};

export default Button;
