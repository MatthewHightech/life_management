import { AUTH_COOKIE_NAME } from "@life/shared";
import { cookies } from "next/headers";
import Link from "next/link";
import { LandingPage } from "@/components/sign-in/landing-page";
import { DEMO_COOKIE_NAME } from "@/demo/mode";
import { getApiUrl } from "@/lib/auth-token";

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  const demoMode = cookieStore.get(DEMO_COOKIE_NAME)?.value === "1";
  const { error } = await searchParams;

  if (token?.value || demoMode) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
        <p className="text-text-muted">
          {demoMode ? "You are currently exploring the demo." : "You are already signed in."}
        </p>
        <Link className="mt-4 text-secondary underline" href="/">
          Go to tasks
        </Link>
        {demoMode ? (
          <a className="mt-2 text-secondary underline" href="/demo/exit">
            Exit demo
          </a>
        ) : null}
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
