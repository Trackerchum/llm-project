type ToolCall = {
	id: string;
	function: {
		name: string;
		arguments: Record<string, unknown>;
		index?: number;
	};
};

export { type ToolCall };
