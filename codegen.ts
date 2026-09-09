import type { CodegenConfig } from "@graphql-codegen/cli";

const sharedConfig = {
  enumsAsTypes: true,
  useTypeImports: true,
  skipTypename: false,
};

const config: CodegenConfig = {
  schema: "./packages/graphql/schema.graphql",
  generates: {
    "apps/web/src/graphql/generated/graphql.ts": {
      documents: ["apps/web/src/graphql/operations/**/*.ts"],
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: sharedConfig,
    },
    "apps/mobile/src/graphql/generated/graphql.ts": {
      documents: ["apps/mobile/src/graphql/operations/**/*.ts"],
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: sharedConfig,
    },
  },
};

export default config;
