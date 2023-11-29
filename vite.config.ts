/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      name: "msw-signalr",
      entry: "src/lib/index.ts",
    },
    rollupOptions: {
      external: ["msw"],
      output: { globals: { msw: "msw" } },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "test/fixture.ts",
  },
});
