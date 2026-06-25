import { createSecretKey } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { AuthUser, sessionMaxAgeSeconds } from "@life/shared";

const JWT_ISSUER = "life-management-api";
const JWT_AUDIENCE = "life-management-clients";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }

  return createSecretKey(Buffer.from(secret));
}

export async function signAuthToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name ?? undefined,
    image: user.image ?? undefined,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${sessionMaxAgeSeconds}s`)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (!payload.sub || typeof payload.email !== "string") {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null,
      image: typeof payload.image === "string" ? payload.image : null,
    };
  } catch {
    return null;
  }
}

export function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}
