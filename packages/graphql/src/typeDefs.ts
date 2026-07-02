import { taskTypeDefs } from "./tasks/schema";
import { mealTypeDefs } from "./meals/schema";
import { typeDefs as baseTypeDefs } from "./schema";

export const typeDefs = [baseTypeDefs, taskTypeDefs, mealTypeDefs];
