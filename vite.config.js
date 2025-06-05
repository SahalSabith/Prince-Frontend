import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron
  build: {
    outDir: 'dist'
  },
  server: {
    host: true,
    allowedHosts: ['f141-2405-201-f02f-c035-35a3-effc-8bd8-836c.ngrok-free.app']
  }
})
