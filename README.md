<div align="center">
<br />

![Vono](.github/banner.jpg)

<h1>Vono</h3>

#### Server plugin for vite.

*Vono is a Vite plugin that minimally transforms your application to run a server on Node, Cloudflare, Netlify, and more.*

</div>

## Overview

Vono is a Vite plugin that makes it easy to add a server to any Vite app and deploy to a range of platforms.
It can be used to add an API to an existing Vite app, or to create a server-side rendered app with Vite without
the need for a separate server framework. 

## Usage

### Install the plugin

```ts
import { defineConfig } from 'vite'
import vono from '@vonojs/vite'

export default defineConfig({
  plugins: [
    vono({
        server: "src/server.ts", // The server entry file
    })
  ]
})
```

### Create a server

```ts
export default (request: Request) => 
    new Response("Hello world!")
```

## Guide

Vono aims to minimally effect your Vite application. It does this by creating it's own Vite environment
for the server, with the output going to `dist-server` by default. You can integrate Vono without
making any changes to your application.

Adaptors can be used to transform the build output into something suitable for deployment on a specific platform.
By default, the Node adaptor is used, which outputs a server file that can be ran standalone, or imported into
another application. Other adaptors like Cloudflares' will run your server inside workerd and output a format
that can be deployed via wrangler with no additional configuration.

### Server entry

The server entry file is the main server entrypoint, and should export a default function
that takes a `Request` object and an optional `Context` object. The function should return a `Response` object. 
Alternatively, you can export an object with a `fetch` method as default, satisfying the same interface.

### Adaptors

Adaptors are used to transform the server output into a format suitable for deployment on a specific platform.
The default is Node, which outputs a server file that can be run standalone or imported into another application.

#### Node

Node is the default adaptor. The server output in `dist-server` can be run with `node dist-server/entry.js`,
and it exports `webHandler` and `nodeHandler` functions that can be imported into another application.

#### Cloudflare

1. Add the Cloudflare adaptor to your config.

```ts
import { defineConfig } from 'vite'
import { vono, CloudflareAdaptor } from '@vonojs/vono'

export default defineConfig({
  plugins: [
    vono({
        server: "src/server.ts", // The server entry file
        adaptor: new CloudflareAdaptor({}) // see @cloudflare/vite-plugin for options
    })
  ]
})
```

2. Add a `wrangler.toml` file to your project.

```toml
name = "my-project"
compatibility_date = "2025-03-28"
main = "./server/index.ts"
assets = { html_handling = "none" }
```

Note: If you want the worker to run on all requests, set `assets.html_handling` to "none". If you want Cloudflare to serve `index.html` statically, set it to "single-page-application"

3. Add a `server/index.ts` file to your project.

```ts
export default {
    async fetch(request: Request) {
        return new Response("Hello world!")
    }
}
```

#### Netlify

```ts
import { defineConfig } from 'vite'
import { vono, NetlifyAdaptor } from '@vonojs/vono'

export default defineConfig({
  plugins: [
    vono({
        server: "src/server.ts", // The server entry file
        adaptor: NetlifyAdaptor // can also call new NetlifyAdaptor()
    })
  ]
})
```

### #vono/html

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

### #vono/manifest

You can access the Vite manifest through the `#vono/manifest` import. This allows you to access the
transformed assets and their paths. This is useful for adding preload links or getting the hashed paths of
assets.

### Types

You can include `@vonojs/vite/server` to your `types` array in tsconfig.json to include types for Vono's virtual modules (#vono/html and #vono/manifest).


### License

Made with 💛

Published under [MIT License](./LICENSE).