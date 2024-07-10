<div align="center">
<br />

![Vono](.github/banner.jpg)

<h1>Vono</h3>

#### Deployable server plugin for vite.

*Vono is a Vite plugin that minimally transforms  your application to run a server with the interface <br> Request => Promise<Response>` <br>on Node, Deno, Bun, Cloudflare, Netlify, and more.*

</div>

### Usage

#### Install the plugin

```ts
import { defineConfig } from 'vite'
import vono from '@vonojs/vono'

export default defineConfig({
  plugins: [
    vono(
      clientEntry: "src/client.ts",
      serverEntry: "src/server.ts"
    )
  ]
})
```

#### Create a server (default `src/server.ts`)

```ts
import { buildTags } from "vonojs/runtime"

export default (request: Request) => new Response(await buildTags("src/client.ts"), { headers: { 'content-type': 'text/html' }})
```

#### Running a built app

By default, Vono will use the Node adaptor to build a Node compatible application.
You can build it with `vite build` and run the built app with `node dist/server`.
It's recommended you replace the `vite preview` command with this as it is not supported with Vono.

#### Examples 

- [Vike](https://github.com/vonojs/with-vike) - A React SSR app with Vike.

### License

Made with 💛

Published under [MIT License](./LICENSE).