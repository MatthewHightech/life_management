"use client";

import { AssigneeAvatars, SelectableMemberAvatar } from "@/components/ui/avatar";
import { FloatingPanel } from "@/components/ui/floating-panel";
import { useAsyncAction } from "@/hooks/use-async-action";
import { usePopoverAnchor } from "@/hooks/use-popover-anchor";
import { toggleAssigneeId } from "@/lib/task-pills";
import { cn } from "@/lib/cn";
import type { BoardTask, HouseholdUser } from "./types";

type EditableAssigneesProps = {
  assignees: BoardTask["assignees"];
  users: HouseholdUser[];
  onSave: (assigneeIds: string[]) => Promise<void>;
  avatarClassName?: string;
  triggerClassName?: string;
};

export function EditableAssignees({
  assignees,
  users,
  onSave,
  avatarClassName,
  triggerClassName: triggerClassNameProp,
}: EditableAssigneesProps) {
  const { open, anchorRef, toggle, close, triggerClassName } = usePopoverAnchor();
  const { pending, run } = useAsyncAction(onSave);
  const selectedIds = assignees.map((assignee) => assignee.id);

  if (users.length === 0) {
    return <AssigneeAvatars assignees={assignees} avatarClassName={avatarClassName} />;
  }

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={toggle}
        title={assignees.length === 0 ? "Assign" : undefined}
        aria-label={assignees.length === 0 ? "Assign people" : undefined}
        className={triggerClassName(
          cn("inline-flex min-h-7 items-center rounded-md px-1 py-0.5", triggerClassNameProp),
        )}
      >
        <AssigneeAvatars assignees={assignees} avatarClassName={avatarClassName} />
      </button>

      <FloatingPanel open={open} anchorRef={anchorRef} onClose={close} minWidth={200} className="p-3">
        <div className="flex flex-wrap justify-center gap-3">
          {users.map((user) => (
            <SelectableMemberAvatar
              key={user.id}
              name={user.name}
              email={user.email}
              image={user.image}
              selected={selectedIds.includes(user.id)}
              disabled={pending}
              onClick={() => void run(toggleAssigneeId(selectedIds, user.id))}
            />
          ))}
        </div>
      </FloatingPanel>
    </>
  );
}
