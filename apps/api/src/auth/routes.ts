import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { signAuthToken } from "./jwt";
import { upsertUserFromGoogleProfile } from "./google-user";
import { clearSessionCookie, setSessionCookie } from "./session-cookie";
import { revokeRefreshToken } from "./refresh-token";

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

    const user = await upsertUserFromGoogleProfile(ticket.getPayload() ?? {});
    if (!user) {
      res.redirect(`${webUrl}/auth/callback?error=AccessDenied`);
      return;
    }

    const token = await signAuthToken(user);
    setSessionCookie(req, res, token);
    res.redirect(`${webUrl}/auth/callback`);
  } catch (error) {
    console.error("Google OAuth callback failed", error);
    res.redirect(`${webUrl}/auth/callback?error=AccessDenied`);
  }
});

router.post("/logout", async (req, res) => {
  const refreshToken =
    typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : null;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  clearSessionCookie(req, res);
  res.status(204).end();
});

export { router as authRouter };
