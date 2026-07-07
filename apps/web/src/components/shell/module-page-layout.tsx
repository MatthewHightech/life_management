import { cn } from "@/lib/cn";

type ModulePageLayoutProps = {
  title: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  contentInsetClassName?: string;
};

const DEFAULT_CONTENT_INSET = "mx-auto w-full max-w-[1280px] px-4 sm:px-6";

export function ModulePageLayout({
  title,
  headerExtra,
  children,
  contentInsetClassName = DEFAULT_CONTENT_INSET,
}: ModulePageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border-subtle bg-surface py-4">
        <div className={cn("flex flex-wrap items-center gap-4", contentInsetClassName)}>
          <h1 className="text-2xl font-semibold tracking-tight text-text-main">{title}</h1>
          {headerExtra}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className={cn("py-6", contentInsetClassName)}>{children}</div>
      </div>
    </div>
  );
}
