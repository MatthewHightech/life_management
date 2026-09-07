import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { upsertUserFromGoogleProfile } from "./google-user";
import { issueMobileTokenPair, rotateRefreshToken, revokeRefreshToken } from "./refresh-token";

const router = Router();

function getGoogleClientId(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is required");
  }
  return clientId;
}

/** Web + iOS client IDs — mobile id tokens use the iOS client as `aud`. */
function getGoogleIdTokenAudiences(): string[] {
  const audiences = [getGoogleClientId()];
  const iosClientId = process.env.GOOGLE_IOS_CLIENT_ID?.trim();
  if (iosClientId && !audiences.includes(iosClientId)) {
    audiences.push(iosClientId);
  }
  return audiences;
}

function getOAuthClientForRedirect(redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required");
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

type MobileGoogleBody = {
  idToken?: string;
  code?: string;
  redirectUri?: string;
  deviceId?: string;
};

router.post("/google", async (req, res) => {
  const body = req.body as MobileGoogleBody;

  try {
    let profile: {
      email?: string | null;
      name?: string | null;
      picture?: string | null;
      email_verified?: boolean | null;
    } | null = null;

    const audiences = getGoogleIdTokenAudiences();

    if (body.idToken) {
      const client = new OAuth2Client(getGoogleClientId());
      const ticket = await client.verifyIdToken({
        idToken: body.idToken,
        audience: audiences,
      });
      profile = ticket.getPayload() ?? null;
    } else if (body.code && body.redirectUri) {
      const client = getOAuthClientForRedirect(body.redirectUri);
      const { tokens } = await client.getToken(body.code);

      if (!tokens.id_token) {
        res.status(401).json({ error: "AccessDenied" });
        return;
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: audiences,
      });
      profile = ticket.getPayload() ?? null;
    } else {
      res.status(400).json({ error: "InvalidRequest" });
      return;
    }

    const user = await upsertUserFromGoogleProfile(profile ?? {});
    if (!user) {
      res.status(401).json({ error: "AccessDenied" });
      return;
    }

    const tokenPair = await issueMobileTokenPair(user, body.deviceId);
    res.json(tokenPair);
  } catch (error) {
    console.error("Mobile Google auth failed", error);
    res.status(401).json({ error: "AccessDenied" });
  }
});

router.post("/refresh", async (req, res) => {
  const refreshToken =
    typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : null;

  if (!refreshToken) {
    res.status(400).json({ error: "InvalidRequest" });
    return;
  }

  const tokenPair = await rotateRefreshToken(refreshToken);
  if (!tokenPair) {
    res.status(401).json({ error: "InvalidRefreshToken" });
    return;
  }

  res.json(tokenPair);
});

router.post("/logout", async (req, res) => {
  const refreshToken =
    typeof req.body?.refreshToken === "string" ? req.body.refreshToken.trim() : null;

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  res.status(204).end();
});

export { router as mobileAuthRouter };
