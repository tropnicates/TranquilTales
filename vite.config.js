const { defineConfig } = require('vite');
const path = require('path');

module.exports = defineConfig({
  root: path.join(__dirname, 'client'),
  publicDir: path.join(__dirname, 'public'),
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:9000',
      '/images': 'http://localhost:9000',
    },
  },
  build: {
    outDir: path.join(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
