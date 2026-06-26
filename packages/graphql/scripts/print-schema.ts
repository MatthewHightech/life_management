import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { print } from "graphql";
import { typeDefs } from "../src/typeDefs.ts";

const root = dirname(fileURLToPath(import.meta.url));

const merged = mergeTypeDefs(typeDefs);
const schema = print(merged);

writeFileSync(join(root, "../schema.graphql"), schema);
console.log("Wrote packages/graphql/schema.graphql");
