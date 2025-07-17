import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:5000',
      '/register': 'http://localhost:5000',
      '/login': 'http://localhost:5000',
      '/submit-score': 'http://localhost:5000',
      '/leaderboard': 'http://localhost:5000',
      '/join-quiz': 'http://localhost:5000',
      '/custom-quiz': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      input: './index.html',
      output: {
        chunkFileNames: '[name].[hash].js',
        entryFileNames: '[name].[hash].js',
      },
    },
  },
});
