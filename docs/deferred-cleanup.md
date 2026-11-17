# Deferred cleanup

Follow-ups found during the Nov 2026 maintainability pass that were **not** implemented. Features should stay the same unless a note says otherwise.

## Adopt shared primitives already added

These components/hooks exist now; remaining call sites still duplicate their chrome.

| Target | Use | Notes |
| --- | --- | --- |
| `apps/web/src/components/editable-table/editable-text-cell.tsx` | `InlineEditInput` from `components/ui/inline-edit-input.tsx` | Finance amount cells already switched; this cell still builds the input itself. |
| `apps/web/src/components/meals/meals-page-layout.tsx` | `useFolderNavigation` from `components/folders/use-folder-navigation.ts` | Gear and receipts already use it. Meals still hand-rolls `currentFolderId`, breadcrumb path, and visible folders/recipes. |
| `apps/web/src/components/meals/recipe-library-section.tsx` | Pass folder objects straight into `FolderTile` | Still copies folders into new objects; gear/receipts already stopped doing this. |

## Shared UI still worth extracting

- **Drag handle + row icon buttons.** The same grip-handle button (and often edit/delete icon buttons) is rebuilt in:
  - `receipts/receipt-row.tsx`
  - `meals/recipe-row.tsx`
  - gear item / class / variant rows
  - `tasks/kanban-card.tsx`
  - `finance/budget/budget-purchase-chip.tsx`
  Put shared primitives in `components/ui/` once the surrounding row APIs are stable.
- **Modal text input class.** This Tailwind string is repeated across folder, receipt, meal, rename, and import modals:

  `min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary`

  Promote it to a shared constant or a small input component under `components/ui/`.
- **Receipt upload primary button.** `receipts/receipt-upload-zone.tsx` styles “Choose files” by hand instead of using the shared `Button`. Left alone earlier to keep the look identical; switching would align it with the primary-action pattern.

## GraphQL / finance backend

- **`packages/graphql/src/finance/resolvers.ts` — shared totals builder.** `budgetCents` / `spentCents` / `remainingCents` / `progressPercent` are assembled the same way for line items, sections, and reports. One helper (e.g. from `{ amountCents, spentCents }` or a list of line graphs) would remove the repeated reduce + `budgetRemaining*` calls.
- **`packages/graphql/src/finance/bank-resolvers.ts`**
  - Deduplicate link-token creation between `createPlaidLinkToken` and `createPlaidUpdateLinkToken` (shared request base + try/catch).
  - Use `PLAID_PRODUCTS` from `@life/plaid` instead of `[Products.Transactions]`.
  - Deduplicate the repeated `bankConnection.findUniqueOrThrow({ include: { accounts… } })` reload after sync / update / reconnect (four call sites).
- **`packages/shared` — `nextBudgetYearMonth`.** `previousBudgetYearMonth` already exists; `monthly-reports-page.tsx` still advances the month by hand. Add the symmetric helper next to it in `budget-report.ts`.

## API (`apps/api`)

- **Shared household auth middleware.** `gear/routes.ts` and `receipts/routes.ts` each define the same `requireHouseholdId` + middleware that sets `res.locals.householdId`. Extract one middleware (and optionally reuse the same auth helper the GraphQL route uses).
- **Parametrize gear photo routes.** Item and variant photo upload/download are near-copies; one route set keyed by kind (`item` | `variant`) would match the web `file-api` shape.
- **Duplicate middleware on `/graphql`.** `index.ts` applies `cors` / `express.json` globally and again on the GraphQL mount. Drop the mount-local duplicates if global coverage is enough.
- **Unused / over-exported auth helpers**
  - `readSessionCookie` in `auth/session-cookie.ts` — defined, unused.
  - `revokeAllUserRefreshTokens` in `auth/refresh-token.ts` — defined, unused.
  - Consider unexporting `extractBearerToken` if nothing imports it outside `jwt.ts` (internal `extractSessionToken` already wraps it).
  - `linkUserToHousehold` is only used inside `google-user.ts`; it does not need to be exported.
- **Shared Google OAuth client / profile typing.** `routes.ts` and `mobile-routes.ts` both construct OAuth clients and call `upsertUserFromGoogleProfile`. Share a small factory + the `GoogleProfile` type.
- **`readRefreshToken(req)` helper.** Body parsing for the refresh token is repeated (~3×) across auth routes.
- **Mobile Google exchange `code` + `redirectUri` path.** `auth/mobile-routes.ts` still accepts an authorization-code exchange. The mobile app only sends an ID token. Confirm nothing else uses the code path, then remove it and `getOAuthClientForRedirect`.

## Plaid / recipe-import

- **`packages/plaid/src/sync.ts`.** `purchaseDate` is built twice as `new Date(\`${draft.purchaseDate}T12:00:00.000Z\`)` in nearby create/update branches. Compute once.
- **`packages/recipe-import/src/ingredient.ts` — `formatQuantity`.** The integer and non-integer branches both `return String(rounded)`; collapse them.
- **Verify `@life/db` in `packages/plaid`.** It is listed as a dependency; confirm whether the package still needs it directly or only via Prisma types already available elsewhere.

## Schema / data

- **Drop `BudgetLineSpend`.** The finance resolver no longer writes spend rows, and nothing reads them. Add a Prisma migration to remove the model/table (`schema.prisma` still defines it) once you are sure no external tooling depends on it.

## Demo / auth polish

- **Demo cookie options.** `apps/web/src/app/demo/enter/route.ts` and `exit/route.ts` repeat the same cookie option object. Export `demoCookieOptions` from `apps/web/src/demo/mode.ts` (or similar) and reuse it.
- **Mobile `expiresIn`.** `MobileTokenPair` in `packages/shared/src/mobile-auth.ts` includes `expiresIn`, but mobile only refreshes after a 401 and never reads it. Either start proactive refresh using it, or stop requiring/storing it if the API can omit it.

## Comments still present (no-comments rule)

Delete or replace with clearer structure when those files are next touched:

| File | Notes |
| --- | --- |
| `apps/web/src/components/finance/budget/plaid-link-launcher.tsx` | Explains a real Plaid vs Radix pointer-events timing constraint. Decide whether to keep as an exception or encode the wait in a named helper. |
| `apps/web/src/lib/task-board-queries.ts` | Doc comment on refetch list. |
| `apps/web/src/components/ui/modal.tsx` | Prop doc comments. |
| `apps/web/src/components/ui/floating-panel.tsx` | Prop doc comment. |
| `apps/web/src/lib/recipe-quantity.ts` | Helper / fraction comments. |
| `apps/web/src/app/providers.tsx` | Explains Apollo cache normalization for budget report IDs across months — same “real constraint” tradeoff as Plaid. |

## Unused npm dependencies (verify before removing)

Confirm with knip / import search, then drop if unused:

| Package | Where listed |
| --- | --- |
| `@types/node-cron` | `apps/api` |
| `expo-status-bar` | `apps/mobile` |
| `eslint-config-next` | `apps/web` (may still be required transitively by the ESLint flat config — verify before removing) |

## Explicitly not deferred as dead code

These were flagged during the pass but **are still used** — do not delete without a further redesign:

- `partitionListTasks` — web task list (`task-table.tsx`)
- `groupTasksByStatus` — mobile tasks tab
