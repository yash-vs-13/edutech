import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SPA history fallback: serve index.html for client routes so reload works
function historyFallback() {
  const fallback = (req, res, next) => {
    const url = req.url || ''
    const pathname = url.split('?')[0]
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname) || pathname.includes('.')
    const isViteInternal = pathname.startsWith('/@') || pathname.startsWith('/node_modules')
    if (!hasExtension && !isViteInternal && pathname !== '/' && pathname !== '/index.html') {
      req.url = '/index.html' + (url.includes('?') ? '?' + url.slice(url.indexOf('?') + 1) : '')
    }
    next()
  }
  return {
    name: 'history-fallback',
    configureServer(server) {
      server.middlewares.use(fallback)
    },
    configurePreviewServer(server) {
      server.middlewares.use(fallback)
    }
  }
}

export default defineConfig({
  plugins: [react(), historyFallback()],
  server: {
    port: 3000,
    open: true
  }
})