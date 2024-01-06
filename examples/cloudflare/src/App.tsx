async function ping() {
  const response = await fetch("/ping");
  const data = await response.text();
  alert(data);
}

export default function App() {
  return <button onClick={ping}>Ping</button>;
}
