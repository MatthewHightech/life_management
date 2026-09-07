import { createHash, randomBytes } from "crypto";
import { prisma } from "@life/db";
import {
  accessTokenMaxAgeSeconds,
  AuthUser,
  MobileAuthUser,
  MobileTokenPair,
  refreshTokenMaxAgeSeconds,
} from "@life/shared";
import { signAccessToken } from "./jwt";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

function toMobileUser(user: AuthUser): MobileAuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
  };
}

export async function issueMobileTokenPair(
  user: AuthUser,
  deviceId?: string | null,
): Promise<MobileTokenPair> {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + refreshTokenMaxAgeSeconds * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      deviceId: deviceId ?? null,
      expiresAt,
    },
  });

  const accessToken = await signAccessToken(user);

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenMaxAgeSeconds,
    user: toMobileUser(user),
  };
}

export async function rotateRefreshToken(
  refreshToken: string,
): Promise<MobileTokenPair | null> {
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user: AuthUser = {
    id: stored.user.id,
    email: stored.user.email,
    name: stored.user.name,
    image: stored.user.image,
  };

  return issueMobileTokenPair(user, stored.deviceId);
}

export async function revokeRefreshToken(refreshToken: string): Promise<boolean> {
  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt) {
    return false;
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return true;
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
