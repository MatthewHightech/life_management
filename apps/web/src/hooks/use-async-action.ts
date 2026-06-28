"use client";

import { useCallback, useState } from "react";

export function useAsyncAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<void> | void,
) {
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (...args: TArgs) => {
      setPending(true);
      try {
        await action(...args);
      } finally {
        setPending(false);
      }
    },
    [action],
  );

  return { pending, run };
}
