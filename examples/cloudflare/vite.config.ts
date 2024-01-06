import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import vono from "@gaiiaa/vono";
import { cloudflare } from "@gaiiaa/vono/adapters";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vono({ adapter: cloudflare() })],
});
