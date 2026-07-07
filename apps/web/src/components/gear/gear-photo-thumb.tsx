"use client";

import { Camera, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { fetchGearItemPhotoBlob, fetchGearVariantPhotoBlob } from "@/lib/gear-photo";
import { cn } from "@/lib/cn";

type GearPhotoThumbProps = {
  kind: "item" | "variant";
  id: string;
  hasPhoto: boolean;
  alt: string;
  className?: string;
  interactive?: boolean;
  disabled?: boolean;
  onPhotoSelect?: (file: File) => void;
};

export function GearPhotoThumb({
  kind,
  id,
  hasPhoto,
  alt,
  className,
  interactive = false,
  disabled = false,
  onPhotoSelect,
}: GearPhotoThumbProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const content = (
    <>
      {thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <Package className="h-5 w-5 text-text-muted" />
      )}
      {interactive && !disabled ? (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover/thumb:opacity-100">
          <Camera className="h-4 w-4 text-white" />
        </span>
      ) : null}
    </>
  );

  const shellClass = cn(
    "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-background",
    className,
  );

  if (!interactive || disabled || !onPhotoSelect) {
    return <span className={shellClass}>{content}</span>;
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onPhotoSelect(file);
          }
          event.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(shellClass, "group/thumb cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary")}
        aria-label={`${hasPhoto ? "Replace" : "Upload"} photo for ${alt}`}
      >
        {content}
      </button>
    </>
  );
}
