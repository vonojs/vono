import { useState } from "react";

function App() {
	const [count, setCount] = useState(Math.random());
	return (
		<main>
			<input value={count} readOnly />
		</main>
	);
}

export default App;
