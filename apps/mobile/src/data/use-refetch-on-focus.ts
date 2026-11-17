import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";

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
