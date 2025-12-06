import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        "content-script": resolve(__dirname, "src/content-script.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        format: "iife",
        dir: "dist",
      },
    },
    outDir: "dist",
    emptyOutDir: false, // Don't clear dist before build
    copyPublicDir: false,
    minify: false, // Disable minification for debugging
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  publicDir: false,
});
