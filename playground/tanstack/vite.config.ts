import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vono from "../../src/index";
import { netlify } from "../../src/adaptors";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vono({ adaptor: netlify({ edge: true }) })],
  build: {
    rollupOptions: {
      input: "ui/entry.client.tsx",
    },
    minify: false,
  },
});
