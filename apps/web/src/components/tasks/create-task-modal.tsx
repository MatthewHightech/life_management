"use client";

import { useMutation } from "@apollo/client";
import { FormEvent, useEffect, useState } from "react";
import { toIsoString, parseOptionalDate } from "@life/shared";
import type { TaskPriority, TaskStatus } from "@/graphql";
import { CREATE_TASK_MUTATION } from "@/graphql";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { kanbanColumns } from "@/lib/task-status";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";

type HouseholdUser = {
  id: string;
  name?: string | null;
  email: string;
};

type CreateTaskModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: HouseholdUser[];
  defaultStatus?: TaskStatus;
};

export function CreateTaskModal({
  open,
  onOpenChange,
  users,
  defaultStatus = "TODO",
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);

  const [createTask, { loading }] = useMutation(CREATE_TASK_MUTATION, {
    refetchQueries: tasksBoardRefetchQueries,
    onCompleted: () => {
      onOpenChange(false);
      setTitle("");
      setDescription("");
      setDueDate("");
      setAssigneeIds([]);
      setStatus(defaultStatus);
      setPriority("MEDIUM");
    },
  });

  useEffect(() => {
    if (open) {
      setStatus(defaultStatus);
    }
  }, [open, defaultStatus]);

  function toggleAssignee(userId: string) {
    setAssigneeIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }

    await createTask({
      variables: {
        input: {
          title: title.trim(),
          description: description.trim() || null,
          status,
          priority,
          dueDate: dueDate ? toIsoString(parseOptionalDate(dueDate)) : null,
          assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
          isShared: true,
        },
      },
    });
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New task" description="Add a task to your household board.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-text-main">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {kanbanColumns.map((column) => (
                <option key={column.status} value={column.status}>
                  {column.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-text-main">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-text-main">Due date</span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        {users.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-text-main">Assignees</legend>
            <div className="space-y-2">
              {users.map((user) => (
                <label key={user.id} className="flex items-center gap-2 text-sm text-text-main">
                  <input
                    type="checkbox"
                    checked={assigneeIds.includes(user.id)}
                    onChange={() => toggleAssignee(user.id)}
                  />
                  {user.name ?? user.email}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? "Creating…" : "Create task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
