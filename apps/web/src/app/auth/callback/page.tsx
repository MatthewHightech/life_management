"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { clearLegacyClientAuthCookie, signOut } from "@/lib/auth-token";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      void signOut().finally(() => {
        router.replace(`/sign-in?error=${encodeURIComponent(error)}`);
      });
      return;
    }

    // Session cookie was set HttpOnly by the API before this redirect.
    clearLegacyClientAuthCookie();
    router.replace("/");
  }, [router, searchParams]);

  return <p className="text-muted">{message}</p>;
}

export default function AuthCallbackPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-6">
      <Suspense fallback={<p className="text-muted">Signing you in…</p>}>
        <AuthCallbackContent />
      </Suspense>
    </main>
  );
}
