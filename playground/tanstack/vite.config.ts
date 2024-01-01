import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vono from "../../src/index";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vono()],
  build: {
    rollupOptions: {
      input: "ui/entry.client.tsx",
    },
    minify: false,
  },
});
