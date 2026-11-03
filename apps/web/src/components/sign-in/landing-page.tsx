import Image from "next/image";

type LandingPageProps = {
  googleSignInUrl: string;
  accessDenied: boolean;
};

export function LandingPage({
  googleSignInUrl,
  accessDenied,
}: LandingPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <Image
          src="/favicon.png"
          alt=""
          width={56}
          height={56}
          className="rounded-xl"
          priority
        />
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-primary">
          Life Management
        </h1>
        <p className="mt-4 text-base leading-7 text-text-muted">
          I&apos;m obsessed with organization.
          <br />
          I love my Google Calender but it wasn&apos;t enough.
          <br />
          I needed simple, no-hassle, and maximum visibility for my family.
          <br />
          So I built this.
        </p>

        {accessDenied ? (
          <p className="mt-5 w-full rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-error">
            This Google account is not on the allowlist.
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={googleSignInUrl}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary-container px-5 py-3 text-sm font-medium text-on-primary transition hover:bg-primary hover:shadow-sm"
          >
            Continue with Google
          </a>
          <a
            href="/demo/enter"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-primary-container bg-transparent px-5 py-3 text-sm font-medium text-primary-container transition hover:bg-sage/40"
          >
            Explore Demo
          </a>
        </div>
        <p className="mt-4 text-xs text-text-muted">
          Account registration is whitelisted for beta-testing. Please try the
          demo!
        </p>
      </div>
    </main>
  );
}
