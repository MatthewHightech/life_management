import { AUTH_COOKIE_NAME } from "@life/shared";
import { cookies } from "next/headers";
import Link from "next/link";
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
        <p className="text-muted">You are already signed in.</p>
        <Link className="mt-4 text-accent underline" href="/">
          Go to tasks
        </Link>
      </main>
    );
  }

  const apiUrl = getApiUrl();

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Life Management</h1>
      <p className="mt-2 text-muted">
        Sign in with your Google account to access your household workspace.
      </p>

      {error === "AccessDenied" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          This Google account is not on the allowlist.
        </p>
      )}

      <a
        href={`${apiUrl}/auth/google`}
        className="mt-8 inline-flex w-fit cursor-pointer items-center justify-center rounded-lg bg-primary-container px-5 py-3 text-sm font-medium text-on-primary transition hover:bg-primary hover:shadow-sm"
      >
        Continue with Google
      </a>
    </main>
  );
}
