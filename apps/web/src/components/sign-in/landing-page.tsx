import Image from "next/image";
import {
  CheckSquare,
  MessageCircle,
  Package,
  Receipt,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

type LandingPageProps = {
  googleSignInUrl: string;
  accessDenied: boolean;
};

export function LandingPage({
  googleSignInUrl,
  accessDenied,
}: LandingPageProps) {
  return (
    <main className="min-h-screen overflow-x-clip bg-background">
      <section className="relative flex min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(173,206,195,0.35),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(227,241,244,0.7),transparent_30%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-12 pt-7 sm:px-10 lg:px-12">
          <header className="flex items-center gap-3">
            <Image
              src="/favicon.png"
              alt=""
              width={42}
              height={42}
              className="rounded-xl"
              priority
            />
            <span className="text-sm font-semibold tracking-tight text-primary">
              Life Management
            </span>
          </header>

          <div className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-xl">
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-primary sm:text-5xl lg:text-6xl">
                Your home, made simple and connected.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-text-muted sm:text-lg">
                Life Management brings tasks, finances, meal planning, receipts,
                and shared gear into one thoughtful workspace so everyone knows
                what&apos;s happening and what&apos;s next.
              </p>

              {accessDenied ? (
                <p className="mt-5 rounded-lg border border-error/20 bg-error-container px-4 py-3 text-sm text-error">
                  This Google account is not on the allowlist.
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-3">
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
                Account registration is whitelisted for beta-testing. Please try the demo!
              </p>
            </div>

            <ProductPreview />
          </div>
        </div>
      </section>
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:mx-0">
      <div className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] bg-sage/70 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-[0_24px_70px_rgba(22,52,45,0.14)]">
        <div className="flex items-center justify-between border-b border-border-subtle bg-background px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-in-progress" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-done" />
          </div>
          <span className="text-[10px] font-medium text-text-muted">
            Household workspace
          </span>
        </div>

        <div className="grid grid-cols-[5.5rem_1fr]">
          <div className="space-y-3 bg-primary p-3">
            {[
              CheckSquare,
              Wallet,
              UtensilsCrossed,
              Receipt,
              Package,
            ].map((Icon, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 rounded-md p-2 ${
                  index === 0 ? "bg-primary-container" : ""
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-on-primary" />
                <span className="h-1.5 flex-1 rounded-full bg-on-primary/30" />
              </div>
            ))}
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold text-text-main">Today</p>
              <p className="mt-1 text-[10px] text-text-muted">
                A clear view of what needs attention.
              </p>
            </div>

            <div className="space-y-2">
              <PreviewTask
                label="Plan meals for the week"
                chip="Medium"
                chipClass="bg-sage text-primary"
              />
              <PreviewTask
                label="Review monthly budget"
                chip="High"
                chipClass="bg-warm-amber text-[#6b3800]"
              />
              <PreviewTask
                label="Return camping gear"
                chip="Low"
                chipClass="bg-muted-blue text-secondary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-sage/70 p-3">
                <Wallet className="h-4 w-4 text-primary" />
                <p className="mt-4 text-[9px] uppercase tracking-wide text-text-muted">
                  Remaining
                </p>
                <p className="mt-1 text-sm font-semibold text-primary">
                  $1,248.00
                </p>
              </div>
              <div className="rounded-lg bg-muted-blue/70 p-3">
                <MessageCircle className="h-4 w-4 text-secondary" />
                <p className="mt-4 text-[9px] uppercase tracking-wide text-text-muted">
                  Household
                </p>
                <p className="mt-1 text-sm font-semibold text-secondary">
                  In sync
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewTask({
  label,
  chip,
  chipClass,
}: {
  label: string;
  chip: string;
  chipClass: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2">
      <span className="h-3.5 w-3.5 rounded border border-border-subtle" />
      <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-text-main">
        {label}
      </span>
      <span className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${chipClass}`}>
        {chip}
      </span>
    </div>
  );
}
