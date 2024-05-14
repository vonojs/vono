import { useState } from "react";
import { lol } from "./users.endpoints.ts";

console.log(await lol(1234))

function App() {
	const [count, setCount] = useState(0);
	return (
		<main>
			<button onClick={(_) => setCount(count + 1)}>the count is {count}</button>
		</main>
	);
}

export default App;
