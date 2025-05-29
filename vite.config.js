
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        trends: 'trends.html',
        dashboard: 'dashboard.html',
        currency: 'currency.html',
        news: 'news.html',
        about: 'about.html',
        contact: 'contact.html',
        login: 'login.html'
      }
    }
  },
  server: {
    port: 8080,
    open: true
  }
})
