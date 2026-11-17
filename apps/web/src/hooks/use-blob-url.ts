"use client";

import { useEffect, useState } from "react";

type BlobUrlState = { url: string | null; failed: boolean };

export function useBlobUrl(load: (() => Promise<Blob>) | null): BlobUrlState {
  const [state, setState] = useState<BlobUrlState>({ url: null, failed: false });

  useEffect(() => {
    if (!load) {
      setState({ url: null, failed: false });
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    void load()
      .then((blob) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, failed: false });
      })
      .catch(() => {
        if (active) {
          setState({ url: null, failed: true });
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [load]);

  return state;
}
