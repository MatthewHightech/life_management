"use client";

import { Info, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useDemoMode } from "@/demo/demo-context";

export function DemoChrome() {
  const demoMode = useDemoMode();
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  useEffect(() => {
    if (!demoMode) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get("demoWelcome") !== "1") return;

    setWelcomeOpen(true);
    url.searchParams.delete("demoWelcome");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [demoMode]);

  if (!demoMode) return null;

  return (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-lemon/70 bg-lemon/45 px-4 py-2 text-xs text-text-main sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">
            You&apos;re exploring a demo. Changes reset when you refresh.
          </span>
        </div>
        <a href="/demo/exit" className="shrink-0 font-semibold text-primary hover:underline">
          Exit demo
        </a>
      </div>

      <Modal
        open={welcomeOpen}
        onOpenChange={setWelcomeOpen}
        title="Welcome to the Life Management demo"
        description="A private sandbox for exploring the app."
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        <div className="space-y-4 text-sm leading-6 text-text-main">
          <div className="flex gap-3 rounded-lg border border-border-subtle bg-background p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-medium">Try it freely</p>
              <p className="mt-1 text-text-muted">
                Create, edit, move, and delete the fictional household data throughout the app.
              </p>
            </div>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-text-muted">
            <li>Your changes stay only in this browser tab and are never saved.</li>
            <li>Refreshing the page restores the original demo household.</li>
            <li>Bank connection and synchronization features are disabled.</li>
          </ul>
          <div className="flex justify-end pt-1">
            <Button type="button" onClick={() => setWelcomeOpen(false)}>
              Start exploring
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
