"use client";

import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { clearAuthToken } from "@/lib/auth-token";

const HOUSEHOLD_QUERY = gql`
  query Household {
    household {
      id
      name
      users {
        id
        email
        name
      }
    }
    me {
      id
      email
      name
    }
  }
`;

export function HomeDashboard() {
  const router = useRouter();
  const { data, loading, error } = useQuery(HOUSEHOLD_QUERY);

  const userName = data?.me?.name ?? data?.me?.email ?? "there";

  function handleSignOut() {
    clearAuthToken();
    router.push("/sign-in");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Tasks</p>
          <h1 className="text-3xl font-semibold tracking-tight">Today</h1>
          <p className="mt-1 text-muted">Welcome back, {userName}.</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-lg border border-slate-200 bg-card px-4 py-2 text-sm"
        >
          Sign out
        </button>
      </header>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium">Household</h2>
        {loading && <p className="mt-2 text-sm text-muted">Loading household…</p>}
        {error && (
          <p className="mt-2 text-sm text-red-600">Could not load household: {error.message}</p>
        )}
        {data?.household && (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-muted">Name:</span> {data.household.name}
            </p>
            <p>
              <span className="text-muted">Members:</span>{" "}
              {data.household.users.map((user: { email: string }) => user.email).join(", ")}
            </p>
          </div>
        )}
        {!loading && !error && !data?.household && (
          <p className="mt-2 text-sm text-muted">No household linked yet.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-card p-6">
        <h2 className="text-lg font-medium">Task list</h2>
        <p className="mt-2 text-sm text-muted">
          Phase 0 foundation is in place. Task management ships in Phase 1.
        </p>
      </section>
    </main>
  );
}
