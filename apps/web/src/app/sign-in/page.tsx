import { AUTH_COOKIE_NAME } from "@life/shared";
import { cookies } from "next/headers";
import Link from "next/link";
import { LandingPage } from "@/components/sign-in/landing-page";
import { getApiUrl } from "@/lib/auth-token";

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  const { error } = await searchParams;

  if (token?.value) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <p className="text-text-muted">You are already signed in.</p>
        <Link className="mt-4 text-secondary underline" href="/">
          Go to tasks
        </Link>
      </main>
    );
  }

  const apiUrl = getApiUrl();

  return (
    <LandingPage
      googleSignInUrl={`${apiUrl}/auth/google`}
      accessDenied={error === "AccessDenied"}
    />
  );
}
