import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@life/db";
import { isEmailAllowlisted, parseAllowedEmails } from "@life/shared";
import { signAuthToken } from "./jwt";

const router = Router();

function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
  }

  return new OAuth2Client(clientId, clientSecret, `${apiUrl}/auth/google/callback`);
}

function getWebUrl() {
  return process.env.WEB_URL ?? "http://localhost:3000";
}

async function linkUserToHousehold(userId: string) {
  const household = await prisma.household.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!household) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { householdId: household.id },
  });
}

router.get("/google", (_req, res) => {
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
  });

  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const webUrl = getWebUrl();

  if (!code) {
    res.redirect(`${webUrl}/auth/callback?error=AccessDenied`);
    return;
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      res.redirect(`${webUrl}/auth/callback?error=AccessDenied`);
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email;
    const allowedEmails = parseAllowedEmails(process.env.ALLOWED_EMAILS);

    if (!email || !isEmailAllowlisted(email, allowedEmails)) {
      res.redirect(`${webUrl}/auth/callback?error=AccessDenied`);
      return;
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: payload?.name ?? null,
        image: payload?.picture ?? null,
        emailVerified: payload?.email_verified ? new Date() : null,
      },
      create: {
        email,
        name: payload?.name ?? null,
        image: payload?.picture ?? null,
        emailVerified: payload?.email_verified ? new Date() : null,
      },
    });

    if (!user.householdId) {
      await linkUserToHousehold(user.id);
    }

    const token = await signAuthToken({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    });

    res.redirect(`${webUrl}/auth/callback?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error("Google OAuth callback failed", error);
    res.redirect(`${webUrl}/auth/callback?error=AccessDenied`);
  }
});

export { router as authRouter };
