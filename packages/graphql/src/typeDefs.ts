import { taskTypeDefs } from "./tasks/schema";
import { mealTypeDefs } from "./meals/schema";
import { folderTypeDefs } from "./folders/schema";
import { receiptTypeDefs } from "./receipts/schema";
import { gearTypeDefs } from "./gear/schema";
import { financeTypeDefs } from "./finance/schema";
import { shoppingTypeDefs } from "./shopping/schema";
import { typeDefs as baseTypeDefs } from "./schema";

export const typeDefs = [
  baseTypeDefs,
  folderTypeDefs,
  taskTypeDefs,
  mealTypeDefs,
  receiptTypeDefs,
  gearTypeDefs,
  financeTypeDefs,
  shoppingTypeDefs,
];
