import { defineConfig } from "vite";
import backend from "../src/vite";
import cloudflare from "../src/adaptors/cloudflare";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    backend({
      adaptor: cloudflare(),
      // prerender: { routes: ["/ssr"] },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        lol: "/src/index.tsx"
      },
    },
  }
});
