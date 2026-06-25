import { expressMiddleware } from "@apollo/server/express4";
import { createApolloServer } from "@life/graphql/server";
import { createGraphQLContext } from "@life/graphql/context";
import { AuthUser } from "@life/shared";
import cors from "cors";
import express from "express";
import { authRouter } from "./auth/routes";
import { extractBearerToken, verifyAuthToken } from "./auth/jwt";

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

  app.use("/auth", authRouter);

  app.use(
    "/graphql",
    cors<cors.CorsRequest>({
      origin: webUrl,
      credentials: true,
    }),
    express.json(),
    async (req, res, next) => {
      const token = extractBearerToken(req.headers.authorization);
      const user = token ? await verifyAuthToken(token) : null;

      if (!user) {
        res.status(401).json({ errors: [{ message: "Unauthorized" }] });
        return;
      }

      req.authUser = user;
      next();
    },
    expressMiddleware(server, {
      context: async ({ req }) => createGraphQLContext(req.authUser ?? null),
    }),
  );

  app.listen(port, () => {
    console.log(`API ready at http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
