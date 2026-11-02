"use client";

import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { GoalsPageLayout } from "@/components/goals/goals-page-layout";
import { PastGoalsArchive } from "@/components/goals/past-goals-archive";
import { PastGoalsStats } from "@/components/goals/past-goals-stats";
import { PAST_GOALS_QUERY } from "@/graphql";

const PAGE_SIZE = 4;

export function PastGoalsPage() {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const { data, loading, error } = useQuery(PAST_GOALS_QUERY, {
    variables: { limit, offset: 0 },
  });

  const archive = data?.pastGoals;

  return (
    <GoalsPageLayout>
      {loading && !archive ? <p className="text-sm text-text-muted">Loading past goals…</p> : null}
      {error ? <p className="text-sm text-error">Could not load past goals.</p> : null}

      {archive ? (
        <>
          <PastGoalsStats stats={archive.stats} />
          <PastGoalsArchive
            daily={archive.daily}
            weekly={archive.weekly}
            term={archive.term}
            hasMoreDaily={archive.hasMoreDaily}
            hasMoreWeekly={archive.hasMoreWeekly}
            hasMoreTerm={archive.hasMoreTerm}
            loadingMore={loading}
            onLoadMore={() => setLimit((current) => current + PAGE_SIZE)}
          />
        </>
      ) : null}
    </GoalsPageLayout>
  );
}
