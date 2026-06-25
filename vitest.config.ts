import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@life/shared": path.resolve(__dirname, "./packages/shared/src/index.ts"),
      "@life/graphql/resolvers": path.resolve(__dirname, "./packages/graphql/src/resolvers.ts"),
      "@life/shared/allowlist": path.resolve(__dirname, "./packages/shared/src/allowlist.ts"),
    },
  },
});
