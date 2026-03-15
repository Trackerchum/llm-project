interface Notification {
	id: string;
	text: string;
	type: "Success" | "Warning" | "Error";
	timeout?: number;
}

export { type Notification };
