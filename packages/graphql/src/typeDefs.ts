import { taskTypeDefs } from "./tasks/schema";
import { typeDefs as baseTypeDefs } from "./schema";

export const typeDefs = [baseTypeDefs, taskTypeDefs];
