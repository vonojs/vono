<div align="center">
<br />

![Vono](.github/banner.jpg)

<h3>Vono</h3>

#### Drop in Hono backend for Vite

[![Npm package yearly downloads](https://badgen.net/npm/dy/express)](https://npmjs.com/package/express)
[![GitHub stars](https://img.shields.io/github/stars/freeCodeCamp/freeCodeCamp.svg?style=social&label=Star&maxAge=2592000)](https://github.com/freeCodeCamp/freeCodeCamp)
[![NuGet stable version](https://badgen.net/nuget/v/newtonsoft.json)](https://nuget.org/packages/newtonsoft.json)

*A Vite plugin for adding a hono backend to any client app. Deploy to Netlify, Cloudflare, Deno, and beyond.*
</div>

## Work In Progress

This is unreleased. Although feature complete, the adapters are probably not all working for all providers.

Create a hono app in `server/index` and export it as default. Vono will pick it up and build it as the server runtime.

You can access Hono's RPC function with `import rpc from "#vono/rpc";`. On the server it directly calls the handler without an additional request. 

You can access the build metadata via `import metadata from "#vono/metadata";`. This allows you to link to build output without any additional steps.

Other plugins can import `useVFS` in order to access the internal Vono virtual file system, accessible at `#vono/vfs`.

Other plugins can also use `registerServer` to attach a set of Hono handlers to Vono's server runtime. This allows plugins to define their own routes.

Thats pretty much it. The point is that it's very minimal and fully extensible, a base to build your own framework off of with the full power of Hono.

## License

Made with 💛

Published under [MIT License](./LICENSE).

