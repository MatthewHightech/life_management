"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { moduleNav } from "@/config/navigation";
import { cn } from "@/lib/cn";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-border-subtle bg-surface px-2 py-2 md:hidden">
      <div className="flex gap-1 overflow-x-auto">
        {moduleNav
          .filter((item) => item.enabled)
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex min-w-[4.5rem] flex-1 flex-col items-center rounded-lg px-2 py-2 text-[10px]",
                  isActive ? "bg-sage text-primary font-medium" : "text-text-muted",
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
