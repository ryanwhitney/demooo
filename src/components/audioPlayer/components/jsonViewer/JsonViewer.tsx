const JsonViewer = ({ data }: { data: string }) => {
	const formattedJson = JSON.stringify(data, null, 2);
	return (
		<pre
			style={{
				padding: "10px",
				overflow: "auto",
				fontSize: 10,
			}}
		>
			<code>{formattedJson}</code>
		</pre>
	);
};

export default JsonViewer;
