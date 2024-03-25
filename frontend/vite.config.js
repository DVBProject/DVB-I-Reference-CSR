// vite.config.js
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
