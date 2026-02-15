import React, { useRef } from "react";
import HorizontalSpacer from "../../horizontalSpacer";
import "./TextInput.scss";

interface Props {
	readonly value: string;
	readonly onChange: (propName: string, newValue: string) => void;
	readonly propName: string;
	readonly labelText?: string;
	readonly placeholder?: string;
	readonly onBlur?: (e: any) => void;
	readonly errorText?: string;
	readonly type?: string;
	readonly disabled?: boolean;
	readonly onKeyDown?: React.KeyboardEventHandler<HTMLInputElement> | undefined;
}

const TextInput = ({
	value,
	onChange,
	propName,
	labelText,
	placeholder,
	onBlur,
	errorText,
	type,
	disabled,
	onKeyDown,
}: Props) => {
	const labelId = useRef(propName);
	return (
		<div className="textInput">
			<div>
				{labelText && <label htmlFor={labelId.current}>{labelText}</label>}
				<input
					name={propName}
					onBlur={onBlur}
					onChange={
						disabled
							? undefined
							: (e: React.ChangeEvent<HTMLInputElement>) => onChange(propName, e.target.value)
					}
					type={type}
					id={labelId.current}
					placeholder={placeholder}
					value={value}
					disabled={disabled}
					onKeyDown={onKeyDown}
				/>
				{errorText ? <p>{errorText}</p> : <HorizontalSpacer />}
			</div>
		</div>
	);
};

export default TextInput;
