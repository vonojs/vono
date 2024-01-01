import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vono from "../../src/index"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), vono()],
})
