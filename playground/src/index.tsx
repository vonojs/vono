import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
const App = () => {
	const [count, setCount] = React.useState(0);
	return (
		<div>
			<h1>Hello World</h1>
			<p>Count: {count}</p>
			<button onClick={() => setCount(count + 1)}>Increment</button>
		</div>
	);
};

if (typeof document !== "undefined") {
	const root = document.getElementById("root");
	if (!root) throw new Error("Root element not found");
	ReactDOM.createRoot(root).render(<App />);
}

export default App;
