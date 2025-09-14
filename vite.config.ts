import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: true,

    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        defaultHandler(warning);
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/__test__/setupTests.ts",
  },
  resolve: {
    alias: {
      data: path.resolve(__dirname, "data"),
      config: path.resolve(__dirname, "config"),
      "@": path.resolve(__dirname, "src"),
    },
  },
});
