import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Jest-compatible globals so tests moved from the app run unchanged.
    globals: true,
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
