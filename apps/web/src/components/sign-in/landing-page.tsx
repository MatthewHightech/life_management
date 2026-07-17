import Image from "next/image";
import {
  Check,
  CheckSquare,
  ChevronDown,
  Eye,
  Feather,
  Layers3,
  MessageCircle,
  Package,
  Receipt,
  UtensilsCrossed,
  Wallet,
  Zap,
} from "lucide-react";
import {
  LandingParallax,
  LandingSectionFocus,
} from "@/components/sign-in/landing-parallax";
import { LandingVisuals } from "@/components/sign-in/landing-visuals";
import { Button } from "@/components/ui/button";

type LandingPageProps = {
  googleSignInUrl: string;
  accessDenied: boolean;
};

const features = [
  {
    icon: CheckSquare,
    title: "Tasks",
    description: "Plan household work, assign owners, set priorities, and keep decisions in comments.",
    color: "bg-muted-blue text-secondary",
  },
  {
    icon: Wallet,
    title: "Finances",
    description: "Build a shared budget, organize purchases, and understand each month at a glance.",
    color: "bg-sage text-primary-container",
  },
  {
    icon: UtensilsCrossed,
    title: "Meals",
    description: "Save recipes, plan the week, and turn ingredients into one practical grocery list.",
    color: "bg-warm-amber text-[#6b3800]",
  },
  {
    icon: Receipt,
    title: "Receipts",
    description: "Keep important receipts organized and easy for the household to find later.",
    color: "bg-error-container text-error",
  },
  {
    icon: Package,
    title: "Gear",
    description: "Track household equipment, lending, and returns without spreadsheets.",
    color: "bg-[#eee8f5] text-[#654b75]",
  },
] as const;

const values = [
  {
    icon: Feather,
    title: "Simplicity",
    description:
      "We all hate complex tools. “Why can’t I just…” is something we find ourselves asking too often. Here, you just can.",
  },
  {
    icon: Zap,
    title: "Speed",
    description:
      "Get to the right tool quickly, understand your data at a glance, and make changes without fighting the interface.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Everyone in the household can see the same information. No more miscommunication. No more surprises.",
  },
  {
    icon: Layers3,
    title: "Cohesion",
    description:
      "Tasks, budgets, meals, receipts, and gear belong together. One shared home replaces a cluttered collection of disconnected apps.",
  },
] as const;

export function LandingPage({
  googleSignInUrl,
  accessDenied,
}: LandingPageProps) {
  return (
    <main
      data-landing-scroll
      className="h-screen overflow-y-auto scroll-smooth bg-background"
    >
      <section className="relative flex min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(173,206,195,0.35),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(227,241,244,0.7),transparent_30%)]" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col px-6 pb-24 pt-7 sm:px-10 lg:px-12">
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
                and shared gear into one thoughtful workspace—so everyone knows
                what is happening and what comes next.
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
                <Button type="button" variant="outline" className="px-5 py-3">
                  Explore Demo
                </Button>
              </div>
              <p className="mt-4 text-xs text-text-muted">
                Private by default. Access is limited to your household.
              </p>
            </div>

            <LandingParallax speed={0.075} maxOffset={46}>
              <ProductPreview />
            </LandingParallax>
          </div>
        </div>

        <a
          href="#learn-more"
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs font-medium text-text-muted transition hover:text-primary"
        >
          <span>Learn more</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </a>
      </section>

      <section
        id="learn-more"
        className="scroll-mt-0 border-y border-border-subtle bg-primary px-6 py-20 text-on-primary sm:px-10 lg:py-28"
      >
        <LandingSectionFocus
          variant="lift"
          className="mx-auto max-w-6xl"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inverse-primary">
              Four core values
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              What we value and why it works
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-inverse-primary">
              Life Management is shaped by four principles that keep the app
              useful, understandable, and easy for the whole household to adopt.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article
                  key={value.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-6"
                >
                  <span className="inline-flex rounded-lg bg-white/10 p-2 text-inverse-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold">{value.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-inverse-primary">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </LandingSectionFocus>
      </section>

      <section
        className="border-b border-border-subtle bg-surface px-6 py-20 sm:px-10 lg:py-28"
      >
        <LandingSectionFocus
          variant="slide-left"
          className="mx-auto max-w-6xl"
        >
          <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Built for real households
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                Less coordination overhead. More room to live.
              </h2>
              <p className="mt-5 leading-7 text-text-muted">
                Household information often lives across texts, notes,
                spreadsheets, and memory. Life Management gives it a shared
                home without turning daily life into project management.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BenefitCard
                title="Know who owns what"
                description="Assignments, avatars, and priorities make responsibilities visible without repeated reminders."
              />
              <BenefitCard
                title="Make decisions together"
                description="Keep context attached to the task or shopping item through household comments."
              />
              <BenefitCard
                title="See the bigger picture"
                description="Monthly finance reports turn individual purchases into a readable household overview."
              />
              <BenefitCard
                title="Keep routines connected"
                description="Recipes become meal plans, meal plans become groceries, and everything stays organized."
              />
            </div>
          </div>
        </LandingSectionFocus>
      </section>

      <LandingVisuals />

      <section className="bg-primary px-6 py-20 text-on-primary sm:px-10 lg:py-28">
        <LandingSectionFocus
          variant="slide-right"
          className="mx-auto max-w-6xl"
        >
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inverse-primary">
              Everything in its place
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              One workspace, built around household life.
            </h2>
            <p className="mt-5 leading-7 text-inverse-primary">
              Each area stays focused while sharing one familiar design, so
              the app remains easy to learn as your household uses more of it.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-5"
                >
                  <span
                    className={`inline-flex rounded-lg p-2 ${feature.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-inverse-primary">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </LandingSectionFocus>
      </section>

      <section className="px-6 py-20 text-center sm:px-10 lg:py-28">
        <LandingSectionFocus
          variant="focus"
          className="mx-auto max-w-2xl"
        >
          <h2 className="text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Make home life feel lighter.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-text-muted">
            Bring your household’s plans, responsibilities, and everyday
            information into one dependable place.
          </p>
          <a
            href={googleSignInUrl}
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-primary-container px-5 py-3 text-sm font-medium text-on-primary transition hover:bg-primary hover:shadow-sm"
          >
            Continue with Google
          </a>
        </LandingSectionFocus>
      </section>

      <footer className="border-t border-border-subtle bg-surface px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center text-xs text-text-muted sm:flex-row sm:text-left">
          <p>© 2026 Life Management</p>
          <p>
            Dreamed, Designed and Built by{" "}
            <a
              href="https://mattsmith.sh/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 transition hover:text-secondary hover:underline"
            >
              Matt Smith
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function BenefitCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-border-subtle bg-background p-5">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage text-primary">
        <Check className="h-4 w-4" />
      </span>
      <h3 className="mt-5 font-semibold text-text-main">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
    </article>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:mx-0">
      <div className="absolute -inset-5 rounded-[2rem] bg-sage/70 blur-2xl" />
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
