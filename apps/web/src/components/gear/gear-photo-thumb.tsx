"use client";

import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchGearItemPhotoBlob, fetchGearVariantPhotoBlob } from "@/lib/gear-photo";
import { cn } from "@/lib/cn";

type GearPhotoThumbProps = {
  kind: "item" | "variant";
  id: string;
  hasPhoto: boolean;
  alt: string;
  className?: string;
};

export function GearPhotoThumb({ kind, id, hasPhoto, alt, className }: GearPhotoThumbProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPhoto) {
      setThumbUrl(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    const load = kind === "item" ? fetchGearItemPhotoBlob(id) : fetchGearVariantPhotoBlob(id);

    void load
      .then((blob) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setThumbUrl(objectUrl);
      })
      .catch(() => {
        if (active) {
          setThumbUrl(null);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [hasPhoto, id, kind]);

  return (
    <span
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-background",
        className,
      )}
    >
      {thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Package className="h-5 w-5 text-text-muted" />
      )}
    </span>
  );
}
