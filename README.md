<div align="center">
<br />

![Vono](.github/banner.jpg)

<h1>Vono</h3>

#### Server plugin for vite.

*Vono is a Vite plugin that minimally transforms your application to run a server on Node, Cloudflare, Netlify, and more.*

</div>

### Usage

#### Install the plugin

```ts
import { defineConfig } from 'vite'
import vono from '@vonojs/vono'

export default defineConfig({
  plugins: [
    vono({
        server: "src/server.ts", // The server entry file
    })
  ]
})
```

#### Create a server

```ts
export default (request: Request) => 
    new Response("Hello world!")
```

#### Add adaptors

```ts
import { defineConfig } from 'vite'
import vono from '@vonojs/vono'
import { CloudflareAdaptor } from '@vonojs/vono/cloudflare'

export default defineConfig({
  plugins: [
    vono({
        server: "src/server.ts", // The server entry file
        adaptor: new CloudflareAdaptor
    })
  ]
})
```

### Guide

Vono aims to minimally effect your Vite application. It does this by creating it's own Vite environment
for the server, with the output going to `dist-server` by default. You can integrate Vono without
making any changes to your application.

Adaptors can be used to transform the build output into something suitable for deployment on a specific platform.
By default, the Node adaptor is used, which outputs a server file that can be ran standalone, or imported into
another application. Other adaptors like Cloudflares' will run your server inside workerd and output a format
that can be deployed via wrangler with no additional configuration.

#### Server entry

The server entry file is the main server entrypoint, and should export a default function
that takes a `Request` object and an optional `Context` object. The function should return a `Response` object. 
Alternatively, you can export an object with a `fetch` method as default, satisfying the same interface.

#### #vono/html

If you are using an html file as your Vite entry, you can access the transformed html on the server through
the `#vono/html` import. This allows you to return the transformed html as a response, possibly with some
additional data like meta tags or a title.

```ts
import html from '#vono/html'

export default (request: Request) => {
    const response = new Response(html, {
        headers: {
            'Content-Type': 'text/html'
        }
    })
    return response
}
```

### License

Made with 💛

Published under [MIT License](./LICENSE).