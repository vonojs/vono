import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vono from "./vono/mod";

export default defineConfig({
  plugins: [vono(), react()],
  build: {
    assetsInlineLimit: 0,
  }
})
