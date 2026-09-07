import { prisma } from "@life/db";
import { AuthUser, isEmailAllowlisted, parseAllowedEmails } from "@life/shared";

export async function linkUserToHousehold(userId: string) {
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

type GoogleProfile = {
  email?: string | null;
  name?: string | null;
  picture?: string | null;
  email_verified?: boolean | null;
};

export async function upsertUserFromGoogleProfile(
  profile: GoogleProfile,
): Promise<AuthUser | null> {
  const email = profile.email;
  const allowedEmails = parseAllowedEmails(process.env.ALLOWED_EMAILS);

  if (!email || !isEmailAllowlisted(email, allowedEmails)) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: profile.name ?? null,
      image: profile.picture ?? null,
      emailVerified: profile.email_verified ? new Date() : null,
    },
    create: {
      email,
      name: profile.name ?? null,
      image: profile.picture ?? null,
      emailVerified: profile.email_verified ? new Date() : null,
    },
  });

  if (!user.householdId) {
    await linkUserToHousehold(user.id);
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
