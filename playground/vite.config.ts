import { defineConfig } from "vite";
import backend from "../src/index";
import cloudflare from "../src/adaptors/cloudflare";
import deno from "../src/adaptors/deno";
import react from "@vitejs/plugin-react";
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  plugins: [
    react(),
    backend({
      adaptor: cloudflare(),
      // prerender: { routes: ["/ssr"] },
    }),
  ]
});
