"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

type AvatarProps = {
  name?: string | null;
  email?: string;
  image?: string | null;
  className?: string;
};

type MemberIdentity = {
  name?: string | null;
  email: string;
};

function memberLabel({ name, email }: MemberIdentity) {
  return name ?? email;
}

function initials(name?: string | null, email?: string) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return email?.[0]?.toUpperCase() ?? "?";
}

export function Avatar({ name, email, image, className }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(image) && !imageFailed;

  if (showImage) {
    return (
      <img
        src={image!}
        alt={name ?? email ?? "User"}
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
        className={cn("h-7 w-7 rounded-full object-cover ring-2 ring-surface", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full bg-sage text-[10px] font-semibold text-primary-container ring-2 ring-surface",
        className,
      )}
    >
      {initials(name, email)}
    </span>
  );
}

type AssigneeAvatarsProps = {
  assignees: Array<{ id: string; name?: string | null; email: string; image?: string | null }>;
  max?: number;
};

export function AssigneeAvatars({ assignees, max = 3 }: AssigneeAvatarsProps) {
  const visible = assignees.slice(0, max);
  const overflow = assignees.length - visible.length;

  return (
    <div className="flex -space-x-2">
      {visible.map((assignee) => (
        <Avatar
          key={assignee.id}
          name={assignee.name}
          email={assignee.email}
          image={assignee.image}
        />
      ))}
      {overflow > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-[10px] font-semibold text-on-primary ring-2 ring-surface">
          +{overflow}
        </span>
      )}
    </div>
  );
}

type SelectableMemberAvatarProps = MemberIdentity & {
  image?: string | null;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export function SelectableMemberAvatar({
  name,
  email,
  image,
  selected,
  onClick,
  disabled,
}: SelectableMemberAvatarProps) {
  const label = memberLabel({ name, email });

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-pressed={selected}
      className="relative rounded-full transition hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Avatar name={name} email={email} image={image} className="h-10 w-10 text-xs" />
      {selected && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-primary/55">
          <Check className="h-4 w-4 text-on-primary" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}
