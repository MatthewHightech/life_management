"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { clearAuthToken, setAuthToken } from "@/lib/auth-token";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      setAuthToken(token);
      router.replace("/");
      return;
    }

    if (error) {
      clearAuthToken();
      router.replace(`/sign-in?error=${encodeURIComponent(error)}`);
      return;
    }

    setMessage("Missing sign-in response. Redirecting…");
    router.replace("/sign-in");
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
