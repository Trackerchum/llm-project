import { useState } from "react";
import Button from "../../components/button/Button";
import TextArea from "../../components/form/textArea/TextArea";
import TextInput from "../../components/form/textInput/TextInput";
import { MCPClient } from "../../fetch/MCPClient";
import "./MCPTestPage.scss";

type ActionType = "initialize" | "tools/list" | "tools/call" | "request";

type LogEntry = {
	action: ActionType;
	request: Record<string, unknown>;
	response: unknown;
	createdAt: string;
};

const client = new MCPClient();

const parseJsonObject = (input: string): Record<string, unknown> => {
	const parsed = JSON.parse(input) as unknown;
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw new Error("JSON input must be an object");
	}
	return parsed as Record<string, unknown>;
};

const MCPTestPage = () => {
	const [initializeParams, setInitializeParams] = useState(
		'{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"main-ui","version":"0.1.0"}}',
	);
	const [toolsListParams, setToolsListParams] = useState("{}");
	const [toolName, setToolName] = useState("");
	const [toolArgs, setToolArgs] = useState("{}");
	const [activeAction, setActiveAction] = useState<ActionType | null>(null);
	const [errorMessage, setErrorMessage] = useState("");
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [sessionId, setSessionId] = useState<string | null>(null);

	const addLog = (entry: LogEntry) => {
		setLogs((prev) => [entry, ...prev]);
	};

	const runAction = async (
		action: ActionType,
		request: Record<string, unknown>,
		callback: () => Promise<unknown>,
	) => {
		setErrorMessage("");
		setActiveAction(action);
		try {
			const response = await callback();
			addLog({
				action,
				request,
				response,
				createdAt: new Date().toLocaleString(),
			});
		} catch (error) {
			setErrorMessage(error instanceof Error ? error.message : String(error));
		} finally {
			setSessionId(client.getSessionId());
			setActiveAction(null);
		}
	};

	const handleInitialize = async () => {
		try {
			const params = parseJsonObject(initializeParams);
			await runAction("initialize", { method: "initialize", params }, () => client.initialize(params));
		} catch (error) {
			setErrorMessage(`Initialize params: ${error instanceof Error ? error.message : String(error)}`);
		}
	};

	const handleToolsList = async () => {
		try {
			const params = parseJsonObject(toolsListParams);
			await runAction("tools/list", { method: "tools/list", params }, () => client.toolsList(params));
		} catch (error) {
			setErrorMessage(`Tools list params: ${error instanceof Error ? error.message : String(error)}`);
		}
	};

	const handleCallTool = async () => {
		if (!toolName.trim()) {
			setErrorMessage("Tool name is required.");
			return;
		}

		try {
			const args = toolArgs.trim() ? parseJsonObject(toolArgs) : undefined;
			const params = args ? { name: toolName.trim(), arguments: args } : { name: toolName.trim() };
			await runAction("tools/call", { method: "tools/call", params }, () => client.callTool(params));
		} catch (error) {
			setErrorMessage(`Tool arguments: ${error instanceof Error ? error.message : String(error)}`);
		}
	};

	return (
		<div className="mcpPage">
			<h1>MCP Method Tester</h1>

			<p className="mcpPage__description">
				Use this page to exercise every method in the MCP client and inspect the JSON-RPC response payloads.
			</p>
			<p className="mcpPage__description">Session ID: {sessionId ?? "not set"}</p>

			{errorMessage && <p className="mcpPage__error">{errorMessage}</p>}

			<section className="mcpPage__panel">
				<h2>initialize</h2>
				<p className="mcpPage__description">
					Handshake note: this triggers two requests - <code>initialize</code> then{" "}
					<code>notifications/initialized</code>.
				</p>
				<TextArea
					labelText="Initialize params (JSON object)"
					propName="initializeParams"
					value={initializeParams}
					onChange={(_, newValue) => setInitializeParams(newValue)}
				/>
				<Button text="Run initialize" onSubmit={handleInitialize} loading={activeAction === "initialize"} />
			</section>

			<section className="mcpPage__panel">
				<h2>tools/list</h2>
				<TextArea
					labelText="Tools list params (JSON object)"
					propName="toolsListParams"
					value={toolsListParams}
					onChange={(_, newValue) => setToolsListParams(newValue)}
				/>
				<Button text="Run tools/list" onSubmit={handleToolsList} loading={activeAction === "tools/list"} />
			</section>

			<section className="mcpPage__panel">
				<h2>tools/call</h2>
				<TextInput
					labelText="Tool name"
					propName="toolNameInput"
					value={toolName}
					placeholder="exampleToolName"
					onChange={(_, newValue) => setToolName(newValue)}
				/>
				<TextArea
					labelText="Arguments (JSON object)"
					propName="toolArgsInput"
					value={toolArgs}
					onChange={(_, newValue) => setToolArgs(newValue)}
				/>
				<Button text="Run tools/call" onSubmit={handleCallTool} loading={activeAction === "tools/call"} />
			</section>

			<section className="mcpPage__panel">
				<h2>Response log</h2>
				{logs.length === 0 && <p>No requests yet.</p>}
				{logs.map((log, index) => (
					<article key={`${log.action}-${index}`} className="mcpPage__logEntry">
						<h3>{log.action}</h3>
						<p>{log.createdAt}</p>
						<strong>Request</strong>
						<pre>{JSON.stringify(log.request, null, 2)}</pre>
						<strong>Response</strong>
						<pre>{JSON.stringify(log.response, null, 2)}</pre>
					</article>
				))}
			</section>
		</div>
	);
};

export default MCPTestPage;
