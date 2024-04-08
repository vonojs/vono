import { useState } from "react";

function App() {
	const [count, setCount] = useState(0);
	return (
		<main>
			<button onClick={(_) => setCount(count + 1)}>the count is {count}</button>
		</main>
	);
}

export default App;
