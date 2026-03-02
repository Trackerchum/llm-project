import React, { useRef } from "react";
import HorizontalSpacer from "../../horizontalSpacer";
import "./TextArea.scss";

interface Props {
	readonly value: string;
	readonly onChange: (propName: string, newValue: string) => void;
	readonly propName: string;
	readonly labelText?: string;
	readonly placeholder?: string;
	readonly onBlur?: (e: any) => void;
	readonly errorText?: string;
	readonly disabled?: boolean;
	readonly rows?: number;
}

const TextArea = ({
	value,
	onChange,
	propName,
	labelText,
	placeholder,
	onBlur,
	errorText,
	disabled,
	rows = 4,
}: Props) => {
	const labelId = useRef(propName);
	return (
		<div className="textArea">
			<div>
				{labelText && <label htmlFor={labelId.current}>{labelText}</label>}
				<textarea
					name={propName}
					onBlur={onBlur}
					onChange={
						disabled
							? undefined
							: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(propName, e.target.value)
					}
					id={labelId.current}
					placeholder={placeholder}
					value={value}
					disabled={disabled}
					rows={rows}
				/>
				{errorText ? <p>{errorText}</p> : <HorizontalSpacer />}
			</div>
		</div>
	);
};

export default TextArea;
