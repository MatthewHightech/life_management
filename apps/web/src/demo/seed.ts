import {
  addDays,
  calendarDayKey,
  formatMonthYear,
  parseOptionalDate,
  startOfWeek,
  subDays,
} from "@life/shared";

export type DemoRecord = Record<string, unknown> & { id: string };

export type DemoState = {
  user: DemoRecord;
  household: DemoRecord;
  tasks: DemoRecord[];
  taskComments: Record<string, DemoRecord[]>;
  shoppingItems: DemoRecord[];
  shoppingComments: Record<string, DemoRecord[]>;
  budgetSections: {
    monthly: DemoRecord[];
    annual: DemoRecord[];
  };
  budgetPurchases: DemoRecord[];
  budgetAllocations: DemoRecord[];
  folders: DemoRecord[];
  recipes: DemoRecord[];
  mealSlots: DemoRecord[];
  groceryItems: DemoRecord[];
  receipts: DemoRecord[];
  gearItems: DemoRecord[];
  gearClasses: DemoRecord[];
  gearLoans: DemoRecord[];
};

const demoUser: DemoRecord = {
  __typename: "User",
  id: "demo-user-luke",
  name: "Luke Skywalker",
  email: "luke@skywalker.demo",
  image: "/demo/luke-skywalker.jpg",
};

const demoPartner: DemoRecord = {
  __typename: "User",
  id: "demo-user-vader",
  name: "Darth Vader",
  email: "vader@empire.demo",
  image: "/demo/darth-vader.jpg",
};

function isoDate(date: Date) {
  return date.toISOString();
}

export function createDemoSeed(): DemoState {
  const now = new Date();
  const today = isoDate(now);
  const tomorrow = isoDate(addDays(now, 1));
  const nextWeek = isoDate(addDays(now, 7));
  const lastWeek = isoDate(subDays(now, 7));
  const lastWeekDate = calendarDayKey(subDays(now, 7));
  const nextWeekDate = calendarDayKey(addDays(now, 7));
  const july31 = isoDate(parseOptionalDate("2026-07-31")!);

  const recipes: DemoRecord[] = [
    {
      __typename: "Recipe",
      id: "recipe-blue-milk-pancakes",
      name: "Blue milk pancakes",
      instructions:
        "Whisk the batter with blue milk, rest for 10 minutes, then cook until lightly browned on both sides.",
      servings: 3,
      folderId: "folder-meals-weekend",
      ingredients: [
        {
          __typename: "RecipeIngredient",
          id: "ingredient-flour",
          name: "Flour",
          quantity: "2",
          unit: "cups",
          sortOrder: 0,
        },
        {
          __typename: "RecipeIngredient",
          id: "ingredient-blue-milk",
          name: "Blue milk",
          quantity: "1.5",
          unit: "cups",
          sortOrder: 1,
        },
      ],
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
    {
      __typename: "Recipe",
      id: "recipe-cantina-noodles",
      name: "Cantina noodle bowl",
      instructions:
        "Boil the noodles, toss with roasted vegetables, and finish with a squeeze of citrus.",
      servings: 4,
      folderId: "folder-meals-weeknight",
      ingredients: [
        {
          __typename: "RecipeIngredient",
          id: "ingredient-noodles",
          name: "Noodles",
          quantity: "450",
          unit: "g",
          sortOrder: 0,
        },
        {
          __typename: "RecipeIngredient",
          id: "ingredient-peppers",
          name: "Bell peppers",
          quantity: "2",
          unit: null,
          sortOrder: 1,
        },
      ],
      createdAt: lastWeek,
      updatedAt: today,
    },
    {
      __typename: "Recipe",
      id: "recipe-endor-stew",
      name: "Endor campfire stew",
      instructions:
        "Brown the protein, add root vegetables and broth, then simmer until thick and hearty.",
      servings: 4,
      folderId: "folder-meals-weeknight",
      ingredients: [
        {
          __typename: "RecipeIngredient",
          id: "ingredient-potatoes",
          name: "Potatoes",
          quantity: "4",
          unit: null,
          sortOrder: 0,
        },
        {
          __typename: "RecipeIngredient",
          id: "ingredient-carrots",
          name: "Carrots",
          quantity: "3",
          unit: null,
          sortOrder: 1,
        },
      ],
      createdAt: lastWeek,
      updatedAt: lastWeek,
    },
  ];

  return {
    user: demoUser,
    household: {
      __typename: "Household",
      id: "demo-household",
      name: "Skywalker Family",
      users: [demoUser, demoPartner],
    },
    tasks: [
      {
        __typename: "Task",
        id: "task-groceries",
        title: "Pick up blue milk",
        status: "TODO",
        priority: "HIGH",
        isShared: true,
        dueDate: tomorrow,
        completedAt: null,
        isBlocked: false,
        isOverdue: false,
        commentCount: 2,
        unreadCommentCount: 1,
        subtaskProgress: {
          __typename: "SubtaskProgress",
          completed: 0,
          total: 0,
          percent: 0,
        },
        assignees: [demoUser],
        project: null,
        createdAt: lastWeek,
        updatedAt: today,
      },
      {
        __typename: "Task",
        id: "task-speeder",
        title: "Fix the landspeeder",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        isShared: true,
        dueDate: nextWeek,
        completedAt: null,
        isBlocked: false,
        isOverdue: false,
        commentCount: 0,
        unreadCommentCount: 0,
        subtaskProgress: {
          __typename: "SubtaskProgress",
          completed: 0,
          total: 0,
          percent: 0,
        },
        assignees: [demoUser],
        project: { __typename: "TaskProject", id: "project-homestead", name: "Homestead upkeep" },
        createdAt: lastWeek,
        updatedAt: today,
      },
      {
        __typename: "Task",
        id: "task-trip",
        title: "Plan weekend trip to Endor",
        status: "WAITING",
        priority: "LOW",
        isShared: true,
        dueDate: nextWeek,
        completedAt: null,
        isBlocked: true,
        isOverdue: false,
        commentCount: 0,
        unreadCommentCount: 0,
        subtaskProgress: {
          __typename: "SubtaskProgress",
          completed: 0,
          total: 0,
          percent: 0,
        },
        assignees: [demoUser, demoPartner],
        project: { __typename: "TaskProject", id: "project-travel", name: "Family travel" },
        createdAt: lastWeek,
        updatedAt: lastWeek,
      },
      {
        __typename: "Task",
        id: "task-vaporator",
        title: "Replace moisture vaporator filter",
        status: "DONE",
        priority: "MEDIUM",
        isShared: true,
        dueDate: lastWeek,
        completedAt: today,
        isBlocked: false,
        isOverdue: false,
        commentCount: 0,
        unreadCommentCount: 0,
        subtaskProgress: {
          __typename: "SubtaskProgress",
          completed: 0,
          total: 0,
          percent: 0,
        },
        assignees: [demoUser],
        project: { __typename: "TaskProject", id: "project-homestead", name: "Homestead upkeep" },
        createdAt: lastWeek,
        updatedAt: today,
      },
      {
        __typename: "Task",
        id: "task-rule-galaxy",
        title: "Rule the Galaxy",
        status: "IN_PROGRESS",
        priority: "URGENT",
        isShared: true,
        dueDate: nextWeek,
        completedAt: null,
        isBlocked: false,
        isOverdue: false,
        commentCount: 0,
        unreadCommentCount: 0,
        subtaskProgress: {
          __typename: "SubtaskProgress",
          completed: 0,
          total: 0,
          percent: 0,
        },
        assignees: [demoPartner],
        project: null,
        createdAt: lastWeek,
        updatedAt: today,
      },
      {
        __typename: "Task",
        id: "task-new-hand",
        title: "Build luke new hand",
        status: "BACKLOG",
        priority: "LOW",
        isShared: true,
        dueDate: july31,
        completedAt: null,
        isBlocked: false,
        isOverdue: false,
        commentCount: 2,
        unreadCommentCount: 1,
        subtaskProgress: {
          __typename: "SubtaskProgress",
          completed: 0,
          total: 0,
          percent: 0,
        },
        assignees: [demoPartner],
        project: null,
        createdAt: lastWeek,
        updatedAt: today,
      },
    ],
    taskComments: {
      "task-groceries": [
        {
          __typename: "TaskComment",
          id: "task-comment-1",
          body: "Also grab power converters if they have them.",
          createdAt: lastWeek,
          canDelete: false,
          author: demoPartner,
        },
        {
          __typename: "TaskComment",
          id: "task-comment-2",
          body: "Added them to the list.",
          createdAt: today,
          canDelete: true,
          author: demoUser,
        },
      ],
      "task-new-hand": [
        {
          __typename: "TaskComment",
          id: "task-comment-hand-1",
          body: "Why do I need a new hand?",
          createdAt: lastWeek,
          canDelete: true,
          author: demoUser,
        },
        {
          __typename: "TaskComment",
          id: "task-comment-hand-2",
          body: "Don't worry about it",
          createdAt: today,
          canDelete: false,
          author: demoPartner,
        },
      ],
    },
    shoppingItems: [
      {
        __typename: "ShoppingItem",
        id: "shopping-converters",
        name: "Power converters",
        budgetCents: 6500,
        urgency: "MEDIUM",
        purchasedAt: null,
        commentCount: 1,
        unreadCommentCount: 0,
        createdAt: lastWeek,
        createdBy: demoPartner,
      },
      {
        __typename: "ShoppingItem",
        id: "shopping-boots",
        name: "Desert boots",
        budgetCents: 14000,
        urgency: "HIGH",
        purchasedAt: null,
        commentCount: 0,
        unreadCommentCount: 0,
        createdAt: today,
        createdBy: demoUser,
      },
      {
        __typename: "ShoppingItem",
        id: "shopping-crates",
        name: "Storage crates",
        budgetCents: 4800,
        urgency: "LOW",
        purchasedAt: lastWeek,
        commentCount: 0,
        unreadCommentCount: 0,
        createdAt: lastWeek,
        createdBy: demoPartner,
      },
    ],
    shoppingComments: {
      "shopping-converters": [
        {
          __typename: "ShoppingItemComment",
          id: "shopping-comment-1",
          body: "Get the ones that fit the speeder, not the farm equipment.",
          createdAt: today,
          canDelete: false,
          author: demoPartner,
        },
      ],
    },
    budgetSections: {
      monthly: [
        {
          __typename: "BudgetSection",
          id: "budget-home",
          name: "Homestead",
          lineItems: [
            {
              __typename: "BudgetLineItem",
              id: "budget-lightsaber",
              sectionId: "budget-home",
              name: "Lightsaber",
              amountCents: 70000,
            },
            {
              __typename: "BudgetLineItem",
              id: "budget-droids",
              sectionId: "budget-home",
              name: "Droids",
              amountCents: 65000,
            },
          ],
        },
        {
          __typename: "BudgetSection",
          id: "budget-life",
          name: "Everyday life",
          lineItems: [
            {
              __typename: "BudgetLineItem",
              id: "budget-dining",
              sectionId: "budget-life",
              name: "Cantina meals",
              amountCents: 20000,
            },
            {
              __typename: "BudgetLineItem",
              id: "budget-transport",
              sectionId: "budget-life",
              name: "Speeder fuel",
              amountCents: 18000,
            },
          ],
        },
      ],
      annual: [
        {
          __typename: "BudgetSection",
          id: "budget-travel",
          name: "Travel",
          lineItems: [
            {
              __typename: "BudgetLineItem",
              id: "budget-vacation",
              sectionId: "budget-travel",
              name: "Trip to Endor",
              amountCents: 240000,
            },
          ],
        },
      ],
    },
    budgetPurchases: [
      {
        __typename: "BudgetPurchase",
        id: "purchase-market",
        name: "Mos Eisley Market",
        amountCents: 8654,
        purchaseDate: today,
        source: "MANUAL",
      },
      {
        __typename: "BudgetPurchase",
        id: "purchase-electric",
        name: "Moisture farm power bill",
        amountCents: 11842,
        purchaseDate: lastWeek,
        source: "MANUAL",
      },
      {
        __typename: "BudgetPurchase",
        id: "purchase-cafe",
        name: "Mos Eisley Cantina",
        amountCents: 3275,
        purchaseDate: lastWeek,
        source: "MANUAL",
      },
      {
        __typename: "BudgetPurchase",
        id: "purchase-hardware",
        name: "Tosche Station",
        amountCents: 4629,
        purchaseDate: today,
        source: "MANUAL",
      },
      {
        __typename: "BudgetPurchase",
        id: "purchase-protocol-droid",
        name: "Protocol droid",
        amountCents: 32000,
        purchaseDate: lastWeek,
        source: "MANUAL",
      },
      {
        __typename: "BudgetPurchase",
        id: "purchase-r2d2",
        name: "R2-D2 unit",
        amountCents: 28000,
        purchaseDate: today,
        source: "MANUAL",
      },
      {
        __typename: "BudgetPurchase",
        id: "purchase-green-crystal",
        name: "Backup green crystal",
        amountCents: 18500,
        purchaseDate: lastWeek,
        source: "MANUAL",
      },
    ],
    budgetAllocations: [
      {
        __typename: "BudgetPurchaseAllocation",
        id: "allocation-market",
        purchaseId: "purchase-market",
        lineItemId: "budget-groceries",
        amountCents: 8654,
      },
      {
        __typename: "BudgetPurchaseAllocation",
        id: "allocation-electric",
        purchaseId: "purchase-electric",
        lineItemId: "budget-utilities",
        amountCents: 11842,
      },
      {
        __typename: "BudgetPurchaseAllocation",
        id: "allocation-cafe",
        purchaseId: "purchase-cafe",
        lineItemId: "budget-dining",
        amountCents: 3275,
      },
      {
        __typename: "BudgetPurchaseAllocation",
        id: "allocation-protocol-droid",
        purchaseId: "purchase-protocol-droid",
        lineItemId: "budget-droids",
        amountCents: 32000,
      },
      {
        __typename: "BudgetPurchaseAllocation",
        id: "allocation-r2d2",
        purchaseId: "purchase-r2d2",
        lineItemId: "budget-droids",
        amountCents: 28000,
      },
      {
        __typename: "BudgetPurchaseAllocation",
        id: "allocation-green-crystal",
        purchaseId: "purchase-green-crystal",
        lineItemId: "budget-lightsaber",
        amountCents: 18500,
      },
    ],
    folders: [
      {
        __typename: "Folder",
        id: "folder-meals-weeknight",
        namespace: "MEALS",
        name: "Weeknight",
        color: "SAGE",
        parentId: null,
      },
      {
        __typename: "Folder",
        id: "folder-meals-weekend",
        namespace: "MEALS",
        name: "Weekend",
        color: "LEMON",
        parentId: null,
      },
      {
        __typename: "Folder",
        id: "folder-receipts-home",
        namespace: "RECEIPTS",
        name: "Homestead",
        color: "SKY",
        parentId: null,
      },
      {
        __typename: "Folder",
        id: "folder-receipts-travel",
        namespace: "RECEIPTS",
        name: "Travel",
        color: "PEACH",
        parentId: null,
      },
      {
        __typename: "Folder",
        id: "folder-gear-camping",
        namespace: "GEAR",
        name: "Rebel gear",
        color: "SAGE",
        parentId: null,
      },
      {
        __typename: "Folder",
        id: "folder-gear-sports",
        namespace: "GEAR",
        name: "Speeder garage",
        color: "LAVENDER",
        parentId: null,
      },
    ],
    recipes,
    mealSlots: [
      {
        __typename: "MealPlanSlot",
        id: "meal-slot-sunday-breakfast",
        day: "SUNDAY",
        slot: "BREAKFAST",
        recipe: recipes[0],
      },
      {
        __typename: "MealPlanSlot",
        id: "meal-slot-monday-dinner",
        day: "MONDAY",
        slot: "DINNER",
        recipe: recipes[1],
      },
      {
        __typename: "MealPlanSlot",
        id: "meal-slot-wednesday-dinner",
        day: "WEDNESDAY",
        slot: "DINNER",
        recipe: recipes[2],
      },
    ],
    groceryItems: [
      {
        __typename: "GroceryListItem",
        id: "grocery-caf",
        name: "Caf beans",
        quantityLabel: "1 bag",
        isBought: false,
        isManual: true,
      },
    ],
    receipts: [
      {
        __typename: "Receipt",
        id: "receipt-market",
        fileName: "Mos Eisley Market.pdf",
        mimeType: "application/pdf",
        byteSize: 84213,
        folderId: "folder-receipts-home",
        notes: "Weekly homestead groceries",
        createdAt: lastWeek,
        updatedAt: lastWeek,
      },
      {
        __typename: "Receipt",
        id: "receipt-hotel",
        fileName: "Cloud City Lodge.pdf",
        mimeType: "application/pdf",
        byteSize: 128440,
        folderId: "folder-receipts-travel",
        notes: "Weekend stay reservation",
        createdAt: today,
        updatedAt: today,
      },
    ],
    gearItems: [
      {
        __typename: "GearItem",
        id: "gear-training-remote",
        name: "Lightsaber training remote",
        description: "Small hovering remote for practice sessions",
        size: null,
        careInstructions: "Charge after each use",
        condition: "GOOD",
        folderId: "folder-gear-camping",
        hasPhoto: false,
        isOnLoan: false,
        createdAt: lastWeek,
        updatedAt: lastWeek,
      },
      {
        __typename: "GearItem",
        id: "gear-speeder",
        name: "Speeder bike",
        description: "Fast scout bike for short trips",
        size: null,
        careInstructions: "Check fuel before lending out",
        condition: "GOOD",
        folderId: "folder-gear-sports",
        hasPhoto: false,
        isOnLoan: true,
        createdAt: lastWeek,
        updatedAt: today,
      },
    ],
    gearClasses: [
      {
        __typename: "GearItemClass",
        id: "gear-class-jedi-robes",
        name: "Jedi robes",
        description: "Everyday robes for training and travel",
        careInstructions: "Hang dry only",
        folderId: "folder-gear-camping",
        createdAt: lastWeek,
        updatedAt: lastWeek,
        variants: [
          {
            __typename: "GearVariant",
            id: "gear-variant-adult",
            classId: "gear-class-jedi-robes",
            name: "Adult",
            size: "Regular",
            condition: "GOOD",
            hasPhoto: false,
            isOnLoan: false,
            createdAt: lastWeek,
            updatedAt: lastWeek,
          },
          {
            __typename: "GearVariant",
            id: "gear-variant-youth",
            classId: "gear-class-jedi-robes",
            name: "Youth",
            size: "Small",
            condition: "LIKE_NEW",
            hasPhoto: false,
            isOnLoan: false,
            createdAt: lastWeek,
            updatedAt: lastWeek,
          },
        ],
      },
    ],
    gearLoans: [
      {
        __typename: "GearLoan",
        id: "gear-loan-speeder",
        borrowerName: "Han Solo",
        borrowerEmail: "han@millenniumfalcon.demo",
        lentAt: lastWeekDate,
        returnBy: nextWeekDate,
        returnedAt: null,
        isOverdue: false,
        createdAt: lastWeek,
        updatedAt: lastWeek,
        items: [
          {
            __typename: "GearLoanItem",
            id: "gear-loan-item-speeder",
            displayName: "Speeder bike",
            hasPhoto: false,
            gearItem: {
              __typename: "GearItem",
              id: "gear-speeder",
              name: "Speeder bike",
              hasPhoto: false,
            },
            gearVariant: null,
          },
        ],
      },
    ],
  };
}

export function demoBudgetTitle() {
  return formatMonthYear(new Date());
}

export function demoWeekStart() {
  return startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString();
}
