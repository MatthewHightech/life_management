import { Products } from "plaid";
import {
  createPlaidClient,
  decryptPlaidAccessToken,
  encryptPlaidAccessToken,
  isCreditCardAccount,
  PLAID_COUNTRY_CODES,
  syncBankConnection,
} from "@life/plaid";
import { GraphQLContext } from "../context";
import { ForbiddenError, requireHouseholdUser } from "../auth";

function toBankAccountGraph(account: {
  id: string;
  plaidAccountId: string;
  name: string;
  officialName: string | null;
  mask: string | null;
  type: string;
  subtype: string | null;
  syncEnabled: boolean;
}) {
  return {
    id: account.id,
    plaidAccountId: account.plaidAccountId,
    name: account.name,
    officialName: account.officialName,
    mask: account.mask,
    type: account.type,
    subtype: account.subtype,
    syncEnabled: account.syncEnabled,
    isCreditCard: isCreditCardAccount(account),
  };
}

function toBankConnectionGraph(connection: {
  id: string;
  institutionId: string | null;
  institutionName: string;
  status: string;
  lastSyncedAt: Date | null;
  lastError: string | null;
  accounts: Parameters<typeof toBankAccountGraph>[0][];
}) {
  return {
    id: connection.id,
    institutionId: connection.institutionId,
    institutionName: connection.institutionName,
    status: connection.status,
    lastSyncedAt: connection.lastSyncedAt?.toISOString() ?? null,
    lastError: connection.lastError,
    accounts: connection.accounts.map(toBankAccountGraph),
  };
}

async function assertConnectionInHousehold(
  context: GraphQLContext,
  connectionId: string,
  householdId: string,
) {
  const connection = await context.prisma.bankConnection.findFirst({
    where: { id: connectionId, householdId },
    include: { accounts: { orderBy: [{ name: "asc" }] } },
  });

  if (!connection) {
    throw new ForbiddenError("Bank connection not found in household");
  }

  return connection;
}

export const bankResolvers = {
  Query: {
    bankConnections: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId } = await requireHouseholdUser(context);
      const connections = await context.prisma.bankConnection.findMany({
        where: {
          householdId,
          status: { not: "DISCONNECTED" },
        },
        include: { accounts: { orderBy: [{ name: "asc" }] } },
        orderBy: [{ createdAt: "asc" }],
      });
      return connections.map(toBankConnectionGraph);
    },
  },

  Mutation: {
    createPlaidLinkToken: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const { householdId, userId } = await requireHouseholdUser(context);
      const client = createPlaidClient();

      const linkTokenRequest: Parameters<typeof client.linkTokenCreate>[0] = {
        user: { client_user_id: `${householdId}:${userId}` },
        client_name: "Life Management",
        products: [Products.Transactions],
        country_codes: [...PLAID_COUNTRY_CODES],
        language: "en",
        transactions: {
          days_requested: 31,
        },
      };

      if (process.env.PLAID_REDIRECT_URI) {
        linkTokenRequest.redirect_uri = process.env.PLAID_REDIRECT_URI;
      }

      const response = await client.linkTokenCreate(linkTokenRequest);

      return {
        linkToken: response.data.link_token,
        expiration: response.data.expiration,
      };
    },

    completePlaidLink: async (
      _parent: unknown,
      args: { publicToken: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const client = createPlaidClient();

      const exchange = await client.itemPublicTokenExchange({
        public_token: args.publicToken,
      });

      const accessToken = exchange.data.access_token;
      const itemId = exchange.data.item_id;

      const existing = await context.prisma.bankConnection.findUnique({
        where: { plaidItemId: itemId },
      });
      if (existing && existing.householdId !== householdId) {
        throw new ForbiddenError("This bank connection belongs to another household");
      }

      const itemResponse = await client.itemGet({ access_token: accessToken });
      const institutionId = itemResponse.data.item.institution_id ?? null;
      let institutionName = "Connected bank";
      if (institutionId) {
        try {
          const institution = await client.institutionsGetById({
            institution_id: institutionId,
            country_codes: [...PLAID_COUNTRY_CODES],
          });
          institutionName = institution.data.institution.name;
        } catch {
          // Keep fallback name.
        }
      }

      const accountsResponse = await client.accountsGet({ access_token: accessToken });
      const encrypted = encryptPlaidAccessToken(accessToken);

      const connection = await context.prisma.$transaction(async (tx) => {
        const saved = await tx.bankConnection.upsert({
          where: { plaidItemId: itemId },
          create: {
            householdId,
            plaidItemId: itemId,
            accessTokenEncrypted: encrypted,
            institutionId,
            institutionName,
            status: "PENDING_SETUP",
          },
          update: {
            accessTokenEncrypted: encrypted,
            institutionId,
            institutionName,
            status: "PENDING_SETUP",
            lastError: null,
          },
        });

        for (const account of accountsResponse.data.accounts) {
          await tx.bankAccount.upsert({
            where: {
              connectionId_plaidAccountId: {
                connectionId: saved.id,
                plaidAccountId: account.account_id,
              },
            },
            create: {
              connectionId: saved.id,
              plaidAccountId: account.account_id,
              name: account.name,
              officialName: account.official_name ?? null,
              mask: account.mask ?? null,
              type: account.type,
              subtype: account.subtype ?? null,
              syncEnabled: false,
            },
            update: {
              name: account.name,
              officialName: account.official_name ?? null,
              mask: account.mask ?? null,
              type: account.type,
              subtype: account.subtype ?? null,
            },
          });
        }

        return tx.bankConnection.findUniqueOrThrow({
          where: { id: saved.id },
          include: { accounts: { orderBy: [{ name: "asc" }] } },
        });
      });

      return toBankConnectionGraph(connection);
    },

    updateBankAccountSync: async (
      _parent: unknown,
      args: { connectionId: string; enabledAccountIds: string[] },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const connection = await assertConnectionInHousehold(context, args.connectionId, householdId);

      const enabled = new Set(args.enabledAccountIds);
      const creditAccountIds = connection.accounts
        .filter((account) => isCreditCardAccount(account))
        .map((account) => account.id);

      for (const accountId of enabled) {
        if (!creditAccountIds.includes(accountId)) {
          throw new ForbiddenError("Only credit card accounts can be enabled for purchase sync");
        }
      }

      await context.prisma.$transaction(
        connection.accounts.map((account) =>
          context.prisma.bankAccount.update({
            where: { id: account.id },
            data: {
              syncEnabled: isCreditCardAccount(account) && enabled.has(account.id),
            },
          }),
        ),
      );

      const updated = await context.prisma.bankConnection.update({
        where: { id: connection.id },
        data: {
          status: enabled.size > 0 ? "ACTIVE" : "PENDING_SETUP",
        },
        include: { accounts: { orderBy: [{ name: "asc" }] } },
      });

      if (enabled.size > 0) {
        await syncBankConnection(context.prisma, updated);
      }

      const refreshed = await context.prisma.bankConnection.findUniqueOrThrow({
        where: { id: connection.id },
        include: { accounts: { orderBy: [{ name: "asc" }] } },
      });

      return toBankConnectionGraph(refreshed);
    },

    disconnectBankConnection: async (
      _parent: unknown,
      args: { connectionId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const connection = await assertConnectionInHousehold(context, args.connectionId, householdId);

      try {
        const client = createPlaidClient();
        const accessToken = decryptPlaidAccessToken(connection.accessTokenEncrypted);
        await client.itemRemove({ access_token: accessToken });
      } catch (error) {
        console.error("[plaid] itemRemove failed", error);
      }

      await context.prisma.bankConnection.delete({ where: { id: connection.id } });
      return true;
    },

    syncBankConnectionNow: async (
      _parent: unknown,
      args: { connectionId: string },
      context: GraphQLContext,
    ) => {
      const { householdId } = await requireHouseholdUser(context);
      const connection = await assertConnectionInHousehold(context, args.connectionId, householdId);
      await syncBankConnection(context.prisma, connection);
      const refreshed = await context.prisma.bankConnection.findUniqueOrThrow({
        where: { id: connection.id },
        include: { accounts: { orderBy: [{ name: "asc" }] } },
      });
      return toBankConnectionGraph(refreshed);
    },
  },
};
