"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth-token";

const navItems = [
  { href: "/", label: "Today", icon: "☀️" },
  { href: "/tasks/calendar", label: "Calendar", icon: "📅" },
  { href: "/tasks/kanban", label: "Kanban", icon: "▦" },
  { href: "/tasks/people", label: "People", icon: "👥" },
  { href: "/finance", label: "Finance", icon: "💰", disabled: true },
  { href: "/calendar", label: "Events", icon: "🗓️", disabled: true },
];

type AppShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

export function AppShell({ children, title, subtitle }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleSignOut() {
    clearAuthToken();
    router.push("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-card p-4 md:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Life Management</p>
            <h1 className="mt-1 text-lg font-semibold">Household</h1>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const className = `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                item.disabled
                  ? "cursor-not-allowed text-slate-400"
                  : isActive
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-slate-700 hover:bg-slate-100"
              }`;

              if (item.disabled) {
                return (
                  <span key={item.href} className={className} title="Coming in Phase 1">
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={className}>
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-8 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
          >
            Sign out
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-card px-4 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm md:hidden"
              >
                Sign out
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>

          <nav className="sticky bottom-0 border-t border-slate-200 bg-card px-2 py-2 md:hidden">
            <div className="grid grid-cols-4 gap-1">
              {navItems
                .filter((item) => !item.disabled)
                .slice(0, 4)
                .map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex flex-col items-center rounded-lg px-2 py-2 text-xs ${
                        isActive ? "bg-accent/10 font-medium text-accent" : "text-slate-600"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
