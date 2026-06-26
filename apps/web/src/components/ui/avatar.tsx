import { cn } from "@/lib/cn";

type AvatarProps = {
  name?: string | null;
  image?: string | null;
  className?: string;
};

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

export function Avatar({ name, image, className }: AvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
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
      {initials(name)}
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
        <Avatar key={assignee.id} name={assignee.name} image={assignee.image} />
      ))}
      {overflow > 0 && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-[10px] font-semibold text-on-primary ring-2 ring-surface">
          +{overflow}
        </span>
      )}
    </div>
  );
}
