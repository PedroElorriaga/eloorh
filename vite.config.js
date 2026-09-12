import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      // Two separate pages: the public site and the recruiter panel. Keeping
      // them as distinct entries means the landing page never downloads the
      // panel's auth code, and Hostinger serves /painel.html as a real file.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        painel: fileURLToPath(new URL('./painel.html', import.meta.url)),
      },
    },
  },
})
