<div align="center">
<br />

![Vono](.github/banner.jpg)

<h1>Vono</h3>

#### Deployable server plugin for vite.

*Vono is a Vite plugin that minimally transforms  your application to run a server with the interface <br> Request => Promise<Response>` <br>on Node, Deno, Bun, Cloudflare, Netlify, and more.*

</div>

### @Next

This is the next branch, undergoing a complete refactor to an agnostic Request => Promise<Response> interface, and
will eventually support the upcoming Vite Environment API. It's designed with the goal of running and deploying [Vike](https://vike.dev)
apps and other plugins designed to fit into the framework-as-a-plugin ecosystem.

### Usage

#### Install the plugin

```ts
import { defineConfig } from 'vite'
import vono from '@vonojs/vono'

export default defineConfig({
  plugins: [
    vono()
  ]
})
```

#### Create a server (default `src/server.entry.ts`)

```ts
// we can access our index.html file from the shell virtual module
import shell from '#vono/shell'

// return the index.html file
export default (request: Request) => new Response(shell, { headers: { 'content-type': 'text/html' }})
```

#### Running a built app

By default, Vono will use the Node adaptor to build a Node compatible application.
You can build it with `vite build` and run the built app with `node dist/server`.
It's recommended you replace the `vite preview` command with this as it is not supported with Vono.

### License

Made with 💛

Published under [MIT License](./LICENSE).