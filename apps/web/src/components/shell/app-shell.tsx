"use client";

import { useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { HouseholdShellQuery } from "@/graphql";
import { HOUSEHOLD_SHELL_QUERY } from "@/graphql";
import { signOut } from "@/lib/auth-token";
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
    void signOut().then(() => {
      router.push("/sign-in");
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        householdName={data?.household?.name ?? "Household"}
        userName={data?.me?.name ?? data?.me?.email}
        userEmail={data?.me?.email}
        userImage={data?.me?.image}
        onSignOut={handleSignOut}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
