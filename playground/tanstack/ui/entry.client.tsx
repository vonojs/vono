import ReactDOM from "react-dom/client";
import { createRouter } from "./router";
import { StartClient } from "@tanstack/react-router-server/client";

const rootElement = document.getElementById("app");
if (rootElement) {
	const router = createRouter();
	router.hydrate();
	ReactDOM.hydrateRoot(rootElement, <StartClient router={router} />);
}
