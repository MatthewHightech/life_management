"use client";

import { useEffect, useRef } from "react";
import { usePlaidLink } from "react-plaid-link";

type PlaidLinkLauncherProps = {
  token: string;
  onSuccess: (publicToken: string) => void;
  onExit: () => void;
};

/**
 * Mount only while a link token exists. Keeping usePlaidLink mounted permanently
 * re-embeds link-initialize.js on remount/navigation.
 */
export function PlaidLinkLauncher({ token, onSuccess, onExit }: PlaidLinkLauncherProps) {
  const openedTokenRef = useRef<string | null>(null);
  const { open, ready } = usePlaidLink({
    token,
    onSuccess,
    onExit,
  });

  useEffect(() => {
    if (!ready || openedTokenRef.current === token) {
      return;
    }

    // Wait briefly so any Radix dialog can release pointer-events before Plaid opens.
    const timer = window.setTimeout(() => {
      openedTokenRef.current = token;
      open();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [ready, open, token]);

  return null;
}
