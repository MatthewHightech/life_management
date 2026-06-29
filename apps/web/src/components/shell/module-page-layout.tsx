type ModulePageLayoutProps = {
  title: string;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
};

export function ModulePageLayout({ title, headerExtra, children }: ModulePageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-border-subtle bg-surface px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight text-text-main">{title}</h1>
          {headerExtra}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
