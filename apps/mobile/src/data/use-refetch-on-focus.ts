import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

/**
 * Re-fetch when the screen regains focus (tab switch, back navigation).
 * Skips the initial mount focus — the query already loads on mount.
 */
export function useRefetchOnFocus(refetch: () => Promise<unknown>, enabled = true) {
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        return;
      }
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      void refetchRef.current();
    }, [enabled]),
  );
}
