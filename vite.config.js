
{/**
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
 */}

 import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Configuração principal do Vite
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // agora "@" aponta para a pasta src/
    },
  },
  server: {
    port: 5173, // porta padrão do Vite
    open: true, // abre o navegador automaticamente
  },
})
