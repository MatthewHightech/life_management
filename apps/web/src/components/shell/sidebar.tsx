"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { moduleNav } from "@/config/navigation";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  householdName?: string;
  userName?: string | null;
  userEmail?: string;
  userImage?: string | null;
  onSignOut: () => void;
  signOutLabel?: string;
};

export function Sidebar({
  collapsed,
  onToggle,
  householdName = "Household",
  userName,
  userEmail,
  userImage,
  onSignOut,
  signOutLabel = "Sign out",
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col bg-primary text-on-primary transition-[width] duration-200 md:flex",
        collapsed ? "w-(--width-sidebar-collapsed)" : "w-(--width-sidebar)",
      )}
    >
      <div className={cn("border-b border-white/10 p-4", collapsed && "px-2")}>
        {!collapsed ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider text-inverse-primary/80">
              Welcome Home
            </p>
            <h1 className="mt-1 text-lg font-semibold">{householdName}</h1>
          </>
        ) : (
          <div className="flex justify-center text-sm font-bold">LM</div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {moduleNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const className = cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
            collapsed && "justify-center px-2",
            item.enabled
              ? isActive
                ? "bg-primary-container text-on-primary"
                : "text-inverse-primary hover:bg-primary-container/70"
              : "cursor-not-allowed text-inverse-primary/40",
          );

          if (!item.enabled) {
            return (
              <span key={item.id} className={className} title="Coming soon">
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </span>
            );
          }

          return (
            <Link key={item.id} href={item.href} className={className} title={collapsed ? item.label : undefined}>
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-inverse-primary hover:bg-primary-container/70",
            collapsed && "justify-center px-2",
          )}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && "Collapse sidebar"}
        </button>
        {!collapsed && userName && (
          <div className="flex items-center gap-2 px-3 py-2">
            <Avatar name={userName} email={userEmail} image={userImage} className="h-8 w-8 text-xs" />
            <span className="truncate text-sm">{userName}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onSignOut}
          className={cn(
            "w-full rounded-lg px-3 py-2 text-left text-sm text-inverse-primary hover:bg-primary-container/70",
            collapsed && "text-center",
          )}
        >
          {collapsed ? "↩" : signOutLabel}
        </button>
      </div>
    </aside>
  );
}
