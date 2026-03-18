import React, { useRef } from "react";
import HorizontalSpacer from "../../horizontalSpacer";
import "./TextInput.scss";

interface Props {
	readonly value: string;
	readonly onChange: (newValue: string) => void;
	readonly name: string;
	readonly labelText?: string;
	readonly placeholder?: string;
	readonly onBlur?: (e: any) => void;
	readonly errorText?: string;
	readonly type?: string;
	readonly disabled?: boolean;
	readonly onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> | undefined;
	readonly appendElement?: React.ReactNode;
}

const TextInput = ({
	value,
	onChange,
	name,
	labelText,
	placeholder,
	onBlur,
	errorText,
	type,
	disabled,
	onKeyDown,
	appendElement,
}: Props) => {
	const labelId = useRef(name);
	return (
		<div className="textInput">
			<div>
				{labelText && <label htmlFor={labelId.current}>{labelText}</label>}
				<input
					name={name}
					onBlur={onBlur}
					onChange={
						disabled ? undefined : (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
					}
					type={type}
					id={labelId.current}
					placeholder={placeholder}
					value={value}
					disabled={disabled}
					onKeyDown={onKeyDown}
				/>
				{appendElement}
				{errorText ? <p>{errorText}</p> : <HorizontalSpacer />}
			</div>
		</div>
	);
};

export default TextInput;
