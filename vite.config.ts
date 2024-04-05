import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vono from "./vono/mod";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vono(), react()],
})
