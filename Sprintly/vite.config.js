import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add any custom aliases if needed
      '@': '/src', // Example alias to simplify imports from the 'src' folder
    },
  },
  optimizeDeps: {
    // Explicitly include FontAwesome packages to ensure Vite handles them correctly
    include: [
      '@fortawesome/react-fontawesome',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
    ],
  },
});
