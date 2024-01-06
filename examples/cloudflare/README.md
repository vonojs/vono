# Cloudflare Adapter

## Vite Config

Import the `cloudflare` adapter and pass it into `vono()`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vono from "@vonojs/vono";
import { cloudflare } from "@vonojs/vono/adapters";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vono({ adapter: cloudflare() })],
});
```

## Deploy

After Running `pnpm run build`,
`cd` into the newly crated `cloudflare` directory and run `wrangler deploy`.
