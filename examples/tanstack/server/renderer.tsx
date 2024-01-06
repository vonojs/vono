// @ts-expect-error
import { renderToString } from "react-dom/server.browser";
import manifest from "#vono/manifest";
import { createMemoryHistory } from "@tanstack/react-router";
import { createRouter } from "../ui/router";
import { StartServer } from "@tanstack/react-router-server/server";

const dev = import.meta.env.DEV;

const reactRefresh = `
import RefreshRuntime from 'http://localhost:5173/@react-refresh'
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true`;

const Shell = (props: {
  head: React.ReactNode;
  scripts: React.ReactNode;
  children: React.ReactNode;
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      {dev && (
        <>
          <script type="module" src="/@vite/client" />
          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: reactRefresh,
            }}
          />
        </>
      )}
      {props.head}
    </head>
    <body>
      <div id="app">{props.children}</div>
      {props.scripts}
    </body>
  </html>
);

export default async function render(url: string) {
  const router = createRouter();

  const memoryHistory = createMemoryHistory({
    initialEntries: [url],
  });

  router.update({
    history: memoryHistory,
  });

  await router.load();

  return renderToString(
    <Shell
      scripts={
        <script type="module" src={manifest["ui/entry.client.tsx"].file} />
      }
      head={<title>Vono x Tanstack</title>}
    >
      <StartServer router={router} />
    </Shell>,
  );
}
