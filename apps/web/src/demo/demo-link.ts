import { ApolloLink, Observable } from "@apollo/client";
import type { FetchResult, Operation } from "@apollo/client";
import {
  budgetRemainingCents,
  budgetRemainingPercent,
  formatBudgetReportTitle,
  mergeGroceryIngredients,
} from "@life/shared";
import { demoBudgetTitle, demoWeekStart, createDemoSeed } from "@/demo/seed";
import type { DemoRecord, DemoState } from "@/demo/seed";
import { DEMO_UNAVAILABLE_MESSAGE } from "@/demo/mode";

type Variables = Record<string, unknown>;

const clone = <T,>(value: T): T => structuredClone(value);

function record(value: unknown): DemoRecord {
  return value as DemoRecord;
}

function input(variables: Variables): Record<string, unknown> {
  return (variables.input ?? {}) as Record<string, unknown>;
}

function stringVariable(variables: Variables, name: string) {
  return String(variables[name] ?? "");
}

function withTimestamp(value: Record<string, unknown>, id: string, typename: string): DemoRecord {
  const timestamp = new Date().toISOString();
  return {
    __typename: typename,
    id,
    ...value,
    createdAt: value.createdAt ?? timestamp,
    updatedAt: timestamp,
  };
}

class DemoStore {
  private state: DemoState = createDemoSeed();
  private sequence = 1;

  constructor() {
    this.regenerateAutoGrocery();
  }

  private regenerateAutoGrocery() {
    const ingredients = this.state.mealSlots.flatMap((slot) => {
      const recipe = slot.recipe as DemoRecord | null;
      return (recipe?.ingredients as DemoRecord[] | undefined) ?? [];
    });

    const merged = mergeGroceryIngredients(
      ingredients.map((ingredient) => ({
        name: String(ingredient.name ?? ""),
        quantity: ingredient.quantity != null ? String(ingredient.quantity) : null,
        unit: ingredient.unit != null ? String(ingredient.unit) : null,
      })),
    );

    const manualItems = this.state.groceryItems.filter((item) => item.isManual);
    this.state.groceryItems = [
      ...manualItems,
      ...merged.map((item) =>
        record({
          __typename: "GroceryListItem",
          id: this.id("grocery"),
          name: item.name,
          quantityLabel: item.quantityLabel,
          isBought: false,
          isManual: false,
        }),
      ),
    ];
  }

  uploadReceipts(files: File[], folderId: string | null) {
    const timestamp = new Date().toISOString();
    const receipts = files.map((file) =>
      record({
        __typename: "Receipt",
        id: this.id("receipt"),
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        byteSize: file.size,
        folderId,
        notes: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    );
    this.state.receipts.unshift(...receipts);
    return receipts;
  }

  setGearPhoto(kind: "item" | "variant", id: string) {
    if (kind === "item") {
      this.find(this.state.gearItems, id).hasPhoto = true;
      return;
    }
    for (const gearClass of this.state.gearClasses) {
      const variant = (gearClass.variants as DemoRecord[]).find((item) => item.id === id);
      if (variant) {
        variant.hasPhoto = true;
        return;
      }
    }
    throw new Error("That gear variant no longer exists.");
  }

  execute(operation: Operation): FetchResult {
    const name = operation.operationName;
    const variables = operation.variables as Variables;
    const handler = this.handlers[name];

    if (!handler) {
      throw new Error(`The demo does not support the ${name || "unnamed"} operation yet.`);
    }

    return { data: clone(handler(variables)) };
  }

  private id(prefix: string) {
    return `demo-${prefix}-${this.sequence++}`;
  }

  private find(items: DemoRecord[], id: string) {
    const item = items.find((candidate) => candidate.id === id);
    if (!item) {
      throw new Error("That demo item no longer exists.");
    }
    return item;
  }

  private update(items: DemoRecord[], id: string, changes: Record<string, unknown>) {
    const item = this.find(items, id);
    Object.assign(item, changes, { updatedAt: new Date().toISOString() });
    return item;
  }

  private remove(items: DemoRecord[], id: string) {
    const index = items.findIndex((item) => item.id === id);
    if (index < 0) return false;
    items.splice(index, 1);
    return true;
  }

  private userById(id: unknown) {
    const users = this.state.household.users as DemoRecord[];
    return users.find((user) => user.id === id) ?? this.state.user;
  }

  private taskWithCounts(task: DemoRecord) {
    const comments = this.state.taskComments[task.id] ?? [];
    return { ...task, commentCount: comments.length };
  }

  private shoppingItemWithCounts(item: DemoRecord) {
    const comments = this.state.shoppingComments[item.id] ?? [];
    return { ...item, commentCount: comments.length };
  }

  private folderView(namespace: string) {
    return this.state.folders
      .filter((folder) => folder.namespace === namespace)
      .map((folder) => {
        let itemCount = 0;
        if (namespace === "MEALS") {
          itemCount = this.state.recipes.filter((item) => item.folderId === folder.id).length;
        } else if (namespace === "RECEIPTS") {
          itemCount = this.state.receipts.filter((item) => item.folderId === folder.id).length;
        } else if (namespace === "GEAR") {
          itemCount =
            this.state.gearItems.filter((item) => item.folderId === folder.id).length +
            this.state.gearClasses.filter((item) => item.folderId === folder.id).length;
        }
        return {
          ...folder,
          itemCount,
          childFolderCount: this.state.folders.filter((item) => item.parentId === folder.id).length,
        };
      });
  }

  private allocationView(allocation: DemoRecord) {
    const purchase = this.find(this.state.budgetPurchases, String(allocation.purchaseId));
    return {
      ...allocation,
      purchaseName: purchase.name,
      purchaseDate: purchase.purchaseDate,
      source: purchase.source,
    };
  }

  private budgetLineView(line: DemoRecord): DemoRecord {
    const spentCents = this.state.budgetAllocations
      .filter((allocation) => allocation.lineItemId === line.id)
      .reduce((sum, allocation) => sum + Number(allocation.amountCents), 0);
    const amountCents = Number(line.amountCents);
    return {
      ...line,
      spentCents,
      remainingCents: budgetRemainingCents(amountCents, spentCents),
      progressPercent: budgetRemainingPercent(spentCents, amountCents),
    };
  }

  private budgetSectionView(section: DemoRecord): DemoRecord {
    const lineItems = (section.lineItems as DemoRecord[]).map((line) => this.budgetLineView(line));
    const budgetCents = lineItems.reduce((sum, line) => sum + Number(line.amountCents), 0);
    const spentCents = lineItems.reduce((sum, line) => sum + Number(line.spentCents), 0);
    return {
      ...section,
      lineItems,
      budgetCents,
      spentCents,
      remainingCents: budgetRemainingCents(budgetCents, spentCents),
      progressPercent: budgetRemainingPercent(spentCents, budgetCents),
    };
  }

  private budgetSections() {
    return {
      monthly: this.state.budgetSections.monthly.map((section) => this.budgetSectionView(section)),
      annual: this.state.budgetSections.annual.map((section) => this.budgetSectionView(section)),
    };
  }

  private findBudgetSection(id: string) {
    return [...this.state.budgetSections.monthly, ...this.state.budgetSections.annual].find(
      (section) => section.id === id,
    );
  }

  private findBudgetLine(id: string) {
    for (const section of [
      ...this.state.budgetSections.monthly,
      ...this.state.budgetSections.annual,
    ]) {
      const line = (section.lineItems as DemoRecord[]).find((item) => item.id === id);
      if (line) return line;
    }
    throw new Error("That budget line no longer exists.");
  }

  private budgetReport(year: number, month: number) {
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    const sections: DemoRecord[] = isCurrentMonth
      ? this.budgetSections().monthly.map((section) => {
          const lineItems = (section.lineItems as DemoRecord[]).map((line) => ({
            __typename: "BudgetReportLineItem",
            id: line.id,
            name: line.name,
            amountCents: line.amountCents,
            spentCents: line.spentCents,
            remainingCents: line.remainingCents,
            progressPercent: line.progressPercent,
            purchases: this.state.budgetAllocations
              .filter((allocation) => allocation.lineItemId === line.id)
              .map((allocation) => {
                const purchase = this.find(
                  this.state.budgetPurchases,
                  String(allocation.purchaseId),
                );
                return {
                  __typename: "BudgetReportPurchase",
                  id: purchase.id,
                  name: purchase.name,
                  purchaseDate: purchase.purchaseDate,
                  amountCents: allocation.amountCents,
                };
              }),
          }));

          return {
            __typename: "BudgetReportSection",
            id: section.id,
            name: section.name,
            budgetCents: section.budgetCents,
            spentCents: section.spentCents,
            remainingCents: section.remainingCents,
            progressPercent: section.progressPercent,
            spentDeltaCents: null,
            spentDeltaPercent: null,
            lineItems,
          };
        })
      : [];
    const budgetCents = sections.reduce((sum, section) => sum + Number(section.budgetCents), 0);
    const spentCents = sections.reduce((sum, section) => sum + Number(section.spentCents), 0);

    return {
      __typename: "BudgetMonthReport",
      year,
      month,
      title: formatBudgetReportTitle(year, month),
      hasReport: isCurrentMonth,
      budgetCents,
      spentCents,
      remainingCents: budgetRemainingCents(budgetCents, spentCents),
      progressPercent: budgetRemainingPercent(spentCents, budgetCents),
      overBudgetSectionNames: sections
        .filter((section) => Number(section.remainingCents) < 0)
        .map((section) => section.name),
      comparison: null,
      sections,
    };
  }

  private recipeFromInput(recipeInput: Record<string, unknown>, existing?: DemoRecord) {
    const recipeId = existing?.id ?? this.id("recipe");
    const ingredients = ((recipeInput.ingredients ?? existing?.ingredients ?? []) as Record<
      string,
      unknown
    >[]).map((ingredient, index) => ({
      __typename: "RecipeIngredient",
      id: existing
        ? ((existing.ingredients as DemoRecord[])[index]?.id ?? this.id("ingredient"))
        : this.id("ingredient"),
      ...ingredient,
      sortOrder: index,
    }));
    return withTimestamp(
      {
        ...existing,
        ...recipeInput,
        ingredients,
        instructions: recipeInput.instructions ?? existing?.instructions ?? null,
        servings: recipeInput.servings ?? existing?.servings ?? null,
        folderId: recipeInput.folderId ?? existing?.folderId ?? null,
      },
      recipeId,
      "Recipe",
    );
  }

  private gearLoanFromInput(loanInput: Record<string, unknown>) {
    const gearItemIds = (loanInput.gearItemIds ?? []) as string[];
    const variantIds = (loanInput.gearVariantIds ?? []) as string[];
    const items: DemoRecord[] = [];
    for (const itemId of gearItemIds) {
      const item = this.find(this.state.gearItems, itemId);
      item.isOnLoan = true;
      items.push({
        __typename: "GearLoanItem",
        id: this.id("loan-item"),
        displayName: item.name,
        hasPhoto: item.hasPhoto,
        gearItem: {
          __typename: "GearItem",
          id: item.id,
          name: item.name,
          hasPhoto: item.hasPhoto,
        },
        gearVariant: null,
      });
    }
    for (const variantId of variantIds) {
      for (const gearClass of this.state.gearClasses) {
        const variant = (gearClass.variants as DemoRecord[]).find((item) => item.id === variantId);
        if (!variant) continue;
        variant.isOnLoan = true;
        items.push({
          __typename: "GearLoanItem",
          id: this.id("loan-item"),
          displayName: `${String(gearClass.name)} · ${String(variant.name)}`,
          hasPhoto: variant.hasPhoto,
          gearItem: null,
          gearVariant: {
            __typename: "GearVariant",
            id: variant.id,
            name: variant.name,
            hasPhoto: variant.hasPhoto,
          },
        });
      }
    }
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    return withTimestamp(
      {
        borrowerName: loanInput.borrowerName,
        borrowerEmail: loanInput.borrowerEmail,
        lentAt: String(loanInput.lentAt ?? today).slice(0, 10),
        returnBy: String(loanInput.returnBy).slice(0, 10),
        returnedAt: null,
        isOverdue: false,
        items,
      },
      this.id("loan"),
      "GearLoan",
    );
  }

  private bankUnavailable(): never {
    throw new Error(DEMO_UNAVAILABLE_MESSAGE);
  }

  private handlers: Record<string, (variables: Variables) => Record<string, unknown>> = {
    HouseholdShell: () => ({
      me: this.state.user,
      household: this.state.household,
    }),

    TasksBoard: (variables) => {
      const filter = (variables.filter ?? {}) as Record<string, unknown>;
      let tasks = this.state.tasks;
      if (filter.status) tasks = tasks.filter((task) => task.status === filter.status);
      if (filter.assigneeId) {
        tasks = tasks.filter((task) =>
          (task.assignees as DemoRecord[]).some((user) => user.id === filter.assigneeId),
        );
      }
      if (filter.projectId) {
        tasks = tasks.filter((task) => (task.project as DemoRecord | null)?.id === filter.projectId);
      }
      if (filter.includeDone === false) tasks = tasks.filter((task) => task.status !== "DONE");
      return {
        tasks: tasks.map((task) => this.taskWithCounts(task)),
        me: this.state.user,
        household: this.state.household,
      };
    },

    CreateTask: (variables) => {
      const taskInput = input(variables);
      const assigneeIds = (taskInput.assigneeIds ?? []) as string[];
      const task = withTimestamp(
        {
          title: taskInput.title,
          status: taskInput.status ?? "TODO",
          priority: taskInput.priority ?? "MEDIUM",
          isShared: taskInput.isShared ?? true,
          dueDate: taskInput.dueDate ?? null,
          completedAt: taskInput.status === "DONE" ? new Date().toISOString() : null,
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
          assignees: assigneeIds.map((id) => this.userById(id)),
          project: null,
        },
        this.id("task"),
        "Task",
      );
      this.state.tasks.unshift(task);
      return { createTask: task };
    },

    UpdateTask: (variables) => {
      const changes = input(variables);
      const task = this.find(this.state.tasks, stringVariable(variables, "id"));
      const previousStatus = task.status;
      Object.assign(task, changes);
      if (changes.assigneeIds) {
        task.assignees = (changes.assigneeIds as string[]).map((id) => this.userById(id));
      }
      if (changes.status === "DONE" && previousStatus !== "DONE") {
        task.completedAt = new Date().toISOString();
      } else if (changes.status && changes.status !== "DONE") {
        task.completedAt = null;
      }
      task.updatedAt = new Date().toISOString();
      return { updateTask: this.taskWithCounts(task) };
    },

    MoveTask: (variables) => {
      const task = this.update(this.state.tasks, stringVariable(variables, "id"), {
        status: variables.status,
        completedAt: variables.status === "DONE" ? new Date().toISOString() : null,
      });
      return { moveTask: this.taskWithCounts(task) };
    },

    DeleteTask: (variables) => {
      const id = stringVariable(variables, "id");
      delete this.state.taskComments[id];
      return { deleteTask: this.remove(this.state.tasks, id) };
    },

    ClearDoneTasks: () => {
      const before = this.state.tasks.length;
      this.state.tasks = this.state.tasks.filter((task) => task.status !== "DONE");
      return { clearDoneTasks: before - this.state.tasks.length };
    },

    TaskComments: (variables) => ({
      taskComments: this.state.taskComments[stringVariable(variables, "taskId")] ?? [],
    }),

    AddTaskComment: (variables) => {
      const taskId = stringVariable(variables, "taskId");
      const comment = withTimestamp(
        {
          body: variables.body,
          canDelete: true,
          author: this.state.user,
        },
        this.id("task-comment"),
        "TaskComment",
      );
      (this.state.taskComments[taskId] ??= []).push(comment);
      return { addTaskComment: comment };
    },

    DeleteTaskComment: (variables) => {
      const id = stringVariable(variables, "id");
      for (const comments of Object.values(this.state.taskComments)) {
        if (this.remove(comments, id)) return { deleteTaskComment: true };
      }
      return { deleteTaskComment: false };
    },

    MarkTaskCommentsRead: (variables) => {
      const task = this.find(this.state.tasks, stringVariable(variables, "taskId"));
      task.unreadCommentCount = 0;
      return { markTaskCommentsRead: true };
    },

    ShoppingList: () => ({
      shoppingItems: this.state.shoppingItems.map((item) => this.shoppingItemWithCounts(item)),
      me: this.state.user,
    }),

    CreateShoppingItem: (variables) => {
      const item = withTimestamp(
        {
          ...input(variables),
          budgetCents: input(variables).budgetCents ?? null,
          urgency: input(variables).urgency ?? "MEDIUM",
          purchasedAt: null,
          commentCount: 0,
          unreadCommentCount: 0,
          createdBy: this.state.user,
        },
        this.id("shopping"),
        "ShoppingItem",
      );
      this.state.shoppingItems.unshift(item);
      return { createShoppingItem: item };
    },

    UpdateShoppingItem: (variables) => ({
      updateShoppingItem: this.update(
        this.state.shoppingItems,
        stringVariable(variables, "id"),
        input(variables),
      ),
    }),

    SetShoppingItemPurchased: (variables) => ({
      setShoppingItemPurchased: this.update(
        this.state.shoppingItems,
        stringVariable(variables, "id"),
        { purchasedAt: variables.purchased ? new Date().toISOString() : null },
      ),
    }),

    DeleteShoppingItem: (variables) => {
      const id = stringVariable(variables, "id");
      delete this.state.shoppingComments[id];
      return { deleteShoppingItem: this.remove(this.state.shoppingItems, id) };
    },

    ClearPurchasedShoppingItems: () => {
      const before = this.state.shoppingItems.length;
      this.state.shoppingItems = this.state.shoppingItems.filter((item) => !item.purchasedAt);
      return { clearPurchasedShoppingItems: before - this.state.shoppingItems.length };
    },

    ShoppingItemComments: (variables) => ({
      shoppingItemComments:
        this.state.shoppingComments[stringVariable(variables, "shoppingItemId")] ?? [],
    }),

    AddShoppingItemComment: (variables) => {
      const shoppingItemId = stringVariable(variables, "shoppingItemId");
      const comment = withTimestamp(
        {
          body: variables.body,
          canDelete: true,
          author: this.state.user,
        },
        this.id("shopping-comment"),
        "ShoppingItemComment",
      );
      (this.state.shoppingComments[shoppingItemId] ??= []).push(comment);
      return { addShoppingItemComment: comment };
    },

    DeleteShoppingItemComment: (variables) => {
      const id = stringVariable(variables, "id");
      for (const comments of Object.values(this.state.shoppingComments)) {
        if (this.remove(comments, id)) return { deleteShoppingItemComment: true };
      }
      return { deleteShoppingItemComment: false };
    },

    MarkShoppingItemCommentsRead: (variables) => {
      const item = this.find(
        this.state.shoppingItems,
        stringVariable(variables, "shoppingItemId"),
      );
      item.unreadCommentCount = 0;
      return { markShoppingItemCommentsRead: true };
    },

    BudgetMonth: () => {
      const sections = this.budgetSections();
      const now = new Date();
      const allocatedPurchaseIds = new Set(
        this.state.budgetAllocations.map((allocation) => allocation.purchaseId),
      );
      return {
        budgetMonth: {
          __typename: "BudgetMonthView",
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          title: demoBudgetTitle(),
          annualTitle: `${now.getFullYear()} annual`,
          purchases: this.state.budgetPurchases.filter(
            (purchase) => !allocatedPurchaseIds.has(purchase.id),
          ),
          monthlySections: sections.monthly,
          annualSections: sections.annual,
        },
      };
    },

    BudgetMonthReport: (variables) => ({
      budgetMonthReport: this.budgetReport(Number(variables.year), Number(variables.month)),
    }),

    BudgetLineAllocations: (variables) => ({
      budgetLineAllocations: this.state.budgetAllocations
        .filter((allocation) => allocation.lineItemId === variables.lineItemId)
        .map((allocation) => this.allocationView(allocation)),
    }),

    CreateBudgetSection: (variables) => {
      const section = record({
        __typename: "BudgetSection",
        id: this.id("budget-section"),
        name: variables.name,
        lineItems: [],
      });
      const target = variables.scope === "ANNUAL" ? "annual" : "monthly";
      this.state.budgetSections[target].push(section);
      return { createBudgetSection: this.budgetSectionView(section) };
    },

    UpdateBudgetSection: (variables) => {
      const section = this.findBudgetSection(stringVariable(variables, "id"));
      if (!section) throw new Error("That budget section no longer exists.");
      section.name = variables.name;
      return { updateBudgetSection: this.budgetSectionView(section) };
    },

    DeleteBudgetSection: (variables) => {
      const id = stringVariable(variables, "id");
      const monthly = this.remove(this.state.budgetSections.monthly, id);
      const annual = this.remove(this.state.budgetSections.annual, id);
      return { deleteBudgetSection: monthly || annual };
    },

    CreateBudgetLineItem: (variables) => {
      const lineInput = input(variables);
      const section = this.findBudgetSection(String(lineInput.sectionId));
      if (!section) throw new Error("That budget section no longer exists.");
      const line = record({
        __typename: "BudgetLineItem",
        id: this.id("budget-line"),
        ...lineInput,
      });
      (section.lineItems as DemoRecord[]).push(line);
      return { createBudgetLineItem: this.budgetLineView(line) };
    },

    UpdateBudgetLineItem: (variables) => {
      const line = this.findBudgetLine(stringVariable(variables, "id"));
      Object.assign(line, input(variables));
      return { updateBudgetLineItem: this.budgetLineView(line) };
    },

    DeleteBudgetLineItem: (variables) => {
      const id = stringVariable(variables, "id");
      let removed = false;
      for (const section of [
        ...this.state.budgetSections.monthly,
        ...this.state.budgetSections.annual,
      ]) {
        removed = this.remove(section.lineItems as DemoRecord[], id) || removed;
      }
      this.state.budgetAllocations = this.state.budgetAllocations.filter(
        (allocation) => allocation.lineItemId !== id,
      );
      return { deleteBudgetLineItem: removed };
    },

    CreateBudgetPurchase: (variables) => {
      const purchase = record({
        __typename: "BudgetPurchase",
        id: this.id("purchase"),
        ...input(variables),
        source: "MANUAL",
      });
      this.state.budgetPurchases.unshift(purchase);
      return { createBudgetPurchase: purchase };
    },

    UpdateBudgetPurchase: (variables) => ({
      updateBudgetPurchase: this.update(
        this.state.budgetPurchases,
        stringVariable(variables, "id"),
        input(variables),
      ),
    }),

    DeleteBudgetPurchase: (variables) => {
      const id = stringVariable(variables, "id");
      this.state.budgetAllocations = this.state.budgetAllocations.filter(
        (allocation) => allocation.purchaseId !== id,
      );
      return { deleteBudgetPurchase: this.remove(this.state.budgetPurchases, id) };
    },

    AllocateBudgetPurchase: (variables) => {
      const purchase = this.find(
        this.state.budgetPurchases,
        stringVariable(variables, "purchaseId"),
      );
      this.findBudgetLine(stringVariable(variables, "lineItemId"));
      const allocation = record({
        __typename: "BudgetPurchaseAllocation",
        id: this.id("allocation"),
        purchaseId: purchase.id,
        lineItemId: variables.lineItemId,
        amountCents: purchase.amountCents,
      });
      this.state.budgetAllocations.push(allocation);
      return { allocateBudgetPurchase: this.allocationView(allocation) };
    },

    DeleteBudgetPurchaseAllocation: (variables) => ({
      deleteBudgetPurchaseAllocation: this.remove(
        this.state.budgetAllocations,
        stringVariable(variables, "id"),
      ),
    }),

    BankConnections: () => ({ bankConnections: [] }),
    CreatePlaidLinkToken: () => this.bankUnavailable(),
    CompletePlaidLink: () => this.bankUnavailable(),
    UpdateBankAccountSync: () => this.bankUnavailable(),
    DisconnectBankConnection: () => this.bankUnavailable(),
    SyncBankConnectionNow: () => this.bankUnavailable(),

    MealPlan: () => ({
      mealPlan: {
        __typename: "MealPlan",
        weekStart: demoWeekStart(),
        recipes: this.state.recipes,
        folders: this.folderView("MEALS"),
        slots: this.state.mealSlots,
        groceryItems: this.state.groceryItems,
      },
    }),

    ImportRecipeFromUrl: (variables) => ({
      importRecipeFromUrl: {
        __typename: "ImportedRecipeDraft",
        name: "Imported cantina recipe",
        instructions: "This is a demo preview generated without contacting the supplied website.",
        servings: 4,
        sourceUrl: variables.url,
        ingredients: [
          {
            __typename: "ImportedRecipeIngredient",
            name: "Roasted root vegetables",
            quantity: "4",
            unit: "cups",
          },
          {
            __typename: "ImportedRecipeIngredient",
            name: "Blue milk",
            quantity: "1",
            unit: "cup",
          },
        ],
      },
    }),

    CreateRecipe: (variables) => {
      const recipe = this.recipeFromInput(input(variables));
      this.state.recipes.unshift(recipe);
      return { createRecipe: recipe };
    },

    UpdateRecipe: (variables) => {
      const existing = this.find(this.state.recipes, stringVariable(variables, "id"));
      const updated = this.recipeFromInput(input(variables), existing);
      Object.assign(existing, updated);
      this.regenerateAutoGrocery();
      return { updateRecipe: existing };
    },

    DeleteRecipe: (variables) => {
      const id = stringVariable(variables, "id");
      this.state.mealSlots = this.state.mealSlots.filter(
        (slot) => (slot.recipe as DemoRecord | null)?.id !== id,
      );
      const deleted = this.remove(this.state.recipes, id);
      this.regenerateAutoGrocery();
      return { deleteRecipe: deleted };
    },

    MoveRecipeToFolder: (variables) => ({
      moveRecipeToFolder: this.update(
        this.state.recipes,
        stringVariable(variables, "recipeId"),
        { folderId: variables.folderId ?? null },
      ),
    }),

    AssignMealPlanSlot: (variables) => {
      const recipe = this.find(this.state.recipes, stringVariable(variables, "recipeId"));
      let slot = this.state.mealSlots.find(
        (item) => item.day === variables.day && item.slot === variables.slot,
      );
      if (!slot) {
        slot = record({
          __typename: "MealPlanSlot",
          id: this.id("meal-slot"),
          day: variables.day,
          slot: variables.slot,
          recipe,
        });
        this.state.mealSlots.push(slot);
      } else {
        slot.recipe = recipe;
      }
      this.regenerateAutoGrocery();
      return { assignMealPlanSlot: slot };
    },

    ClearMealPlanSlot: (variables) => {
      this.state.mealSlots = this.state.mealSlots.filter(
        (slot) => !(slot.day === variables.day && slot.slot === variables.slot),
      );
      this.regenerateAutoGrocery();
      return { clearMealPlanSlot: true };
    },

    AddGroceryItem: (variables) => {
      const item = record({
        __typename: "GroceryListItem",
        id: this.id("grocery"),
        ...input(variables),
        quantityLabel: input(variables).quantityLabel ?? "",
        isBought: false,
        isManual: true,
      });
      this.state.groceryItems.push(item);
      return { addGroceryItem: item };
    },

    UpdateGroceryItem: (variables) => ({
      updateGroceryItem: this.update(
        this.state.groceryItems,
        stringVariable(variables, "id"),
        input(variables),
      ),
    }),

    DeleteGroceryItem: (variables) => ({
      deleteGroceryItem: this.remove(
        this.state.groceryItems,
        stringVariable(variables, "id"),
      ),
    }),

    RemoveBoughtGroceryItems: () => {
      const before = this.state.groceryItems.length;
      this.state.groceryItems = this.state.groceryItems.filter((item) => !item.isBought);
      return { removeBoughtGroceryItems: before - this.state.groceryItems.length };
    },

    ReceiptLibrary: () => ({
      receiptLibrary: {
        __typename: "ReceiptLibrary",
        folders: this.folderView("RECEIPTS"),
        receipts: this.state.receipts,
      },
    }),

    RenameReceipt: (variables) => ({
      renameReceipt: this.update(this.state.receipts, stringVariable(variables, "id"), {
        fileName: variables.fileName,
      }),
    }),

    UpdateReceiptNotes: (variables) => ({
      updateReceiptNotes: this.update(this.state.receipts, stringVariable(variables, "id"), {
        notes: variables.notes ?? null,
      }),
    }),

    DeleteReceipt: (variables) => ({
      deleteReceipt: this.remove(this.state.receipts, stringVariable(variables, "id")),
    }),

    MoveReceiptToFolder: (variables) => ({
      moveReceiptToFolder: this.update(
        this.state.receipts,
        stringVariable(variables, "receiptId"),
        { folderId: variables.folderId ?? null },
      ),
    }),

    GearLibrary: () => ({
      gearLibrary: {
        __typename: "GearLibrary",
        folders: this.folderView("GEAR"),
        items: this.state.gearItems,
        classes: this.state.gearClasses,
      },
    }),

    GearLending: () => ({
      gearLending: {
        __typename: "GearLending",
        activeLoans: this.state.gearLoans.filter((loan) => !loan.returnedAt),
        loanHistory: this.state.gearLoans.filter((loan) => loan.returnedAt),
      },
    }),

    CreateGearItem: (variables) => {
      const item = withTimestamp(
        {
          ...input(variables),
          condition: input(variables).condition ?? "GOOD",
          folderId: input(variables).folderId ?? null,
          hasPhoto: false,
          isOnLoan: false,
        },
        this.id("gear-item"),
        "GearItem",
      );
      this.state.gearItems.unshift(item);
      return { createGearItem: item };
    },

    UpdateGearItem: (variables) => ({
      updateGearItem: this.update(
        this.state.gearItems,
        stringVariable(variables, "id"),
        input(variables),
      ),
    }),

    DeleteGearItem: (variables) => ({
      deleteGearItem: this.remove(this.state.gearItems, stringVariable(variables, "id")),
    }),

    MoveGearItemToFolder: (variables) => ({
      moveGearItemToFolder: this.update(
        this.state.gearItems,
        stringVariable(variables, "gearItemId"),
        { folderId: variables.folderId ?? null },
      ),
    }),

    CreateGearItemClass: (variables) => {
      const gearClass = withTimestamp(
        {
          ...input(variables),
          folderId: input(variables).folderId ?? null,
          variants: [],
        },
        this.id("gear-class"),
        "GearItemClass",
      );
      this.state.gearClasses.unshift(gearClass);
      return { createGearItemClass: gearClass };
    },

    UpdateGearItemClass: (variables) => ({
      updateGearItemClass: this.update(
        this.state.gearClasses,
        stringVariable(variables, "id"),
        input(variables),
      ),
    }),

    DeleteGearItemClass: (variables) => ({
      deleteGearItemClass: this.remove(
        this.state.gearClasses,
        stringVariable(variables, "id"),
      ),
    }),

    MoveGearItemClassToFolder: (variables) => ({
      moveGearItemClassToFolder: this.update(
        this.state.gearClasses,
        stringVariable(variables, "classId"),
        { folderId: variables.folderId ?? null },
      ),
    }),

    CreateGearVariant: (variables) => {
      const variantInput = input(variables);
      const gearClass = this.find(this.state.gearClasses, String(variantInput.classId));
      const variant = withTimestamp(
        {
          ...variantInput,
          condition: variantInput.condition ?? "GOOD",
          hasPhoto: false,
          isOnLoan: false,
        },
        this.id("gear-variant"),
        "GearVariant",
      );
      (gearClass.variants as DemoRecord[]).push(variant);
      return { createGearVariant: variant };
    },

    UpdateGearVariant: (variables) => {
      for (const gearClass of this.state.gearClasses) {
        const variant = (gearClass.variants as DemoRecord[]).find(
          (item) => item.id === variables.id,
        );
        if (variant) {
          Object.assign(variant, input(variables), { updatedAt: new Date().toISOString() });
          return { updateGearVariant: variant };
        }
      }
      throw new Error("That gear variant no longer exists.");
    },

    DeleteGearVariant: (variables) => {
      for (const gearClass of this.state.gearClasses) {
        if (this.remove(gearClass.variants as DemoRecord[], stringVariable(variables, "id"))) {
          return { deleteGearVariant: true };
        }
      }
      return { deleteGearVariant: false };
    },

    CreateGearLoan: (variables) => {
      const loan = this.gearLoanFromInput(input(variables));
      this.state.gearLoans.unshift(loan);
      return { createGearLoan: loan };
    },

    MarkGearLoanReturned: (variables) => {
      const loan = this.update(this.state.gearLoans, stringVariable(variables, "id"), {
        returnedAt: new Date().toISOString(),
      });
      for (const loanItem of loan.items as DemoRecord[]) {
        if (loanItem.gearItem) {
          const item = this.find(
            this.state.gearItems,
            String((loanItem.gearItem as DemoRecord).id),
          );
          item.isOnLoan = false;
        }
        if (loanItem.gearVariant) {
          const variantId = String((loanItem.gearVariant as DemoRecord).id);
          for (const gearClass of this.state.gearClasses) {
            const variant = (gearClass.variants as DemoRecord[]).find(
              (item) => item.id === variantId,
            );
            if (variant) variant.isOnLoan = false;
          }
        }
      }
      return { markGearLoanReturned: loan };
    },

    ClearGearLoanHistory: () => {
      this.state.gearLoans = this.state.gearLoans.filter((loan) => !loan.returnedAt);
      return { clearGearLoanHistory: true };
    },

    CreateFolder: (variables) => {
      const folder = record({
        __typename: "Folder",
        id: this.id("folder"),
        ...input(variables),
        parentId: input(variables).parentId ?? null,
        itemCount: 0,
        childFolderCount: 0,
      });
      this.state.folders.push(folder);
      return { createFolder: folder };
    },

    UpdateFolder: (variables) => ({
      updateFolder: this.update(
        this.state.folders,
        stringVariable(variables, "id"),
        input(variables),
      ),
    }),

    DeleteFolder: (variables) => {
      const id = stringVariable(variables, "id");
      for (const item of [
        ...this.state.recipes,
        ...this.state.receipts,
        ...this.state.gearItems,
        ...this.state.gearClasses,
      ]) {
        if (item.folderId === id) item.folderId = null;
      }
      return { deleteFolder: this.remove(this.state.folders, id) };
    },
  };
}

export function createDemoLink() {
  const store = new DemoStore();
  activeDemoStore = store;

  return new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        try {
          observer.next(store.execute(operation));
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }),
  );
}

let activeDemoStore: DemoStore | null = null;

export function isDemoRuntimeActive() {
  return activeDemoStore !== null;
}

export function uploadDemoReceipts(files: File[], folderId: string | null) {
  if (!activeDemoStore) throw new Error("The demo is not ready.");
  return activeDemoStore.uploadReceipts(files, folderId);
}

export function setDemoGearPhoto(kind: "item" | "variant", id: string) {
  if (!activeDemoStore) throw new Error("The demo is not ready.");
  activeDemoStore.setGearPhoto(kind, id);
}
