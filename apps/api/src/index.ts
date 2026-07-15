import { expressMiddleware } from "@apollo/server/express4";
import { createApolloServer } from "@life/graphql/server";
import { createGraphQLContext } from "@life/graphql/context";
import { AuthUser } from "@life/shared";
import cookieParser from "cookie-parser";
import cors from "cors";
import cron from "node-cron";
import express from "express";
import { authRouter } from "./auth/routes";
import { extractSessionToken, verifyAuthToken } from "./auth/jwt";
import { runMealPlanWeekRollover } from "./cron/meal-plan-rollover";
import { runBankTransactionSync } from "./cron/bank-transaction-sync";
import { createReceiptRouter } from "./receipts/routes.js";
import { createGearRouter } from "./gear/routes.js";
import { createLocalFileStorage } from "./storage/local.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

const port = Number(process.env.PORT ?? 4000);
const webUrl = process.env.WEB_URL ?? "http://localhost:3000";

async function main() {
  const app = express();
  const fileStorage = createLocalFileStorage();
  app.set("trust proxy", 1);
  const server = createApolloServer();

  await server.start();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(
    cors({
      origin: webUrl,
      credentials: true,
    }),
  );
  app.use(cookieParser());

  app.use("/auth", authRouter);
  app.use("/receipts", createReceiptRouter(fileStorage));
  app.use("/gear", createGearRouter(fileStorage));

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: webUrl,
      credentials: true,
    }),
    express.json(),
    async (req, res, next) => {
      const token = extractSessionToken(req);
      const user = token ? await verifyAuthToken(token) : null;

      if (!user) {
        res.status(401).json({ errors: [{ message: "Unauthorized" }] });
        return;
      }

      req.authUser = user;
      next();
    },
    expressMiddleware(server, {
      context: async ({ req }) =>
        createGraphQLContext(req.authUser ?? null, {
          deleteReceiptFile: (storageKey) => fileStorage.delete(storageKey),
          deleteGearPhoto: (storageKey) => fileStorage.delete(storageKey),
        }),
    }),
  );

  app.listen(port, () => {
    console.log(`API ready at http://localhost:${port}`);
  });

  cron.schedule(
    "0 0 * * 0",
    () => {
      void runMealPlanWeekRollover().catch((error) => {
        console.error("[meal-plan] rollover failed", error);
      });
    },
    { timezone: "America/Los_Angeles" },
  );

  cron.schedule(
    "0 21 * * *",
    () => {
      void runBankTransactionSync().catch((error) => {
        console.error("[plaid] nightly sync failed", error);
      });
    },
    { timezone: "America/Los_Angeles" },
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
