import {
  CheckSquare,
  Home,
  Package,
  Receipt,
  ShoppingBasket,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import {
  LandingParallax,
  LandingSectionFocus,
} from "@/components/sign-in/landing-parallax";

const budgetBars = [
  { label: "Food", spent: 68, remaining: 32 },
  { label: "Home", spent: 46, remaining: 54 },
  { label: "Car", spent: 82, remaining: 18 },
] as const;

const week = [
  { day: "Mon", meal: "Tacos" },
  { day: "Tue", meal: "Pasta" },
  { day: "Wed", meal: "Stir-fry" },
  { day: "Thu", meal: "Soup" },
  { day: "Fri", meal: "Pizza" },
] as const;

const modules = [
  { label: "Tasks", icon: CheckSquare, color: "bg-muted-blue text-secondary" },
  { label: "Finance", icon: Wallet, color: "bg-sage text-primary" },
  { label: "Meals", icon: UtensilsCrossed, color: "bg-warm-amber text-[#6b3800]" },
  { label: "Receipts", icon: Receipt, color: "bg-error-container text-error" },
  { label: "Gear", icon: Package, color: "bg-[#eee8f5] text-[#654b75]" },
] as const;

export function LandingVisuals() {
  return (
    <section className="overflow-hidden px-6 py-20 sm:px-10 lg:py-28">
      <LandingSectionFocus
        variant="focus"
        className="mx-auto max-w-6xl"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            See it at a glance
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Useful information, made visual.
          </h2>
          <p className="mt-5 leading-7 text-text-muted">
            The important details stay readable, connected, and close at hand.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <LandingParallax
            speed={0.045}
            maxOffset={28}
            className="lg:col-span-7"
          >
            <BudgetVisual />
          </LandingParallax>

          <LandingParallax
            speed={-0.04}
            maxOffset={26}
            className="lg:col-span-5"
          >
            <MealPlanVisual />
          </LandingParallax>

          <LandingParallax
            speed={0.03}
            maxOffset={20}
            className="lg:col-span-12"
          >
            <ConnectedModulesVisual />
          </LandingParallax>
        </div>
      </LandingSectionFocus>
    </section>
  );
}

function VisualHeader({
  eyebrow,
  title,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-text-main">{title}</h3>
      </div>
      <span className="rounded-lg bg-sage p-2 text-primary">
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}

function BudgetVisual() {
  return (
    <article className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-[0_18px_50px_rgba(22,52,45,0.08)]">
      <VisualHeader
        eyebrow="Monthly finances"
        title="Know where the month stands"
        icon={Wallet}
      />

      <div className="mt-7 grid grid-cols-3 gap-3">
        {[
          ["Budget", "$4,200"],
          ["Spent", "$2,614"],
          ["Remaining", "$1,586"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-background p-3">
            <p className="text-[9px] uppercase tracking-wide text-text-muted">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 space-y-4">
        {budgetBars.map((bar) => (
          <div
            key={bar.label}
            className="grid grid-cols-[3.5rem_1fr] items-center gap-3"
          >
            <span className="text-xs text-text-muted">{bar.label}</span>
            <div className="flex h-3 overflow-hidden rounded-full">
              <span
                className="bg-status-in-progress"
                style={{ width: `${bar.spent}%` }}
              />
              <span
                className="bg-[#c5dbc8]"
                style={{ width: `${bar.remaining}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function MealPlanVisual() {
  return (
    <article className="h-full rounded-2xl border border-border-subtle bg-surface p-6 shadow-[0_18px_50px_rgba(22,52,45,0.08)]">
      <VisualHeader
        eyebrow="Weekly meals"
        title="Plan once, shop clearly"
        icon={UtensilsCrossed}
      />

      <div className="mt-7 grid grid-cols-5 gap-2">
        {week.map((entry, index) => (
          <div key={entry.day} className="min-w-0">
            <p className="text-center text-[9px] font-semibold uppercase text-text-muted">
              {entry.day}
            </p>
            <div
              className={`mt-2 flex h-24 items-end rounded-lg p-2 ${
                index % 2 === 0 ? "bg-warm-amber" : "bg-sage"
              }`}
            >
              <span className="truncate text-[9px] font-medium text-primary">
                {entry.meal}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-border-subtle bg-background p-3">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="h-4 w-4 text-secondary" />
          <span className="text-xs font-semibold text-text-main">
            Grocery list
          </span>
          <span className="ml-auto rounded-full bg-muted-blue px-2 py-0.5 text-[9px] font-medium text-secondary">
            12 items
          </span>
        </div>
        <div className="mt-3 flex gap-2">
          {["Tomatoes", "Rice", "Cheese"].map((item) => (
            <span
              key={item}
              className="rounded-md bg-surface px-2 py-1 text-[9px] text-text-muted"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function ConnectedModulesVisual() {
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface px-5 py-8 shadow-[0_18px_50px_rgba(22,52,45,0.08)] sm:px-8">
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <div key={module.label} className="contents">
              <div className="flex min-w-24 flex-col items-center gap-2">
                <span className={`rounded-xl p-3 ${module.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-text-main">
                  {module.label}
                </span>
              </div>
              {index < modules.length - 1 ? (
                <span className="hidden h-px flex-1 bg-gradient-to-r from-border-subtle via-inverse-primary to-border-subtle lg:block" />
              ) : null}
            </div>
          );
        })}

        <div className="flex min-w-24 flex-col items-center gap-2 lg:order-[-1]">
          <span className="rounded-xl bg-primary p-3 text-on-primary">
            <Home className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold text-primary">Your home</span>
        </div>
      </div>
    </article>
  );
}
