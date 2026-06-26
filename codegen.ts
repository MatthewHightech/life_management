import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "./packages/graphql/schema.graphql",
  documents: ["apps/web/src/graphql/operations/**/*.ts"],
  generates: {
    "apps/web/src/graphql/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        enumsAsTypes: true,
        useTypeImports: true,
        skipTypename: false,
      },
    },
  },
};

export default config;
