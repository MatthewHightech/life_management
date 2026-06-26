"use client";

import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { HouseholdShellQuery } from "@/graphql";
import { HOUSEHOLD_SHELL_QUERY } from "@/graphql";
import { clearAuthToken } from "@/lib/auth-token";
import { readSidebarCollapsed, writeSidebarCollapsed } from "@/lib/sidebar-preference";
import { MobileNav } from "@/components/shell/mobile-nav";
import { Sidebar } from "@/components/shell/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data } = useQuery<HouseholdShellQuery>(HOUSEHOLD_SHELL_QUERY);

  useEffect(() => {
    setCollapsed(readSidebarCollapsed());
  }, []);

  function handleToggle() {
    setCollapsed((current) => {
      const next = !current;
      writeSidebarCollapsed(next);
      return next;
    });
  }

  function handleSignOut() {
    clearAuthToken();
    router.push("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        householdName={data?.household?.name ?? "Household"}
        userName={data?.me?.name ?? data?.me?.email}
        userImage={data?.me?.image}
        onSignOut={handleSignOut}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
