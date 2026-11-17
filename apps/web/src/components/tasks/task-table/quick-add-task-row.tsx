"use client";

import { useMutation } from "@apollo/client";
import { useState } from "react";
import type { TaskStatus } from "@/graphql";
import { CreateTaskDocument } from "@/graphql";
import { inlineFieldInputClass } from "@/lib/inline-edit-styles";
import { cn } from "@/lib/cn";
import { useTaskBoards } from "@/components/tasks/task-boards-context";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";

const DEFAULT_STATUS: TaskStatus = "TODO";

type QuickAddTaskRowProps = {
  currentUserId?: string;
};

export function QuickAddTaskRow({ currentUserId }: QuickAddTaskRowProps) {
  const { activeBoardId } = useTaskBoards();
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState(false);

  const [createTask, { loading }] = useMutation(CreateTaskDocument, {
    refetchQueries: tasksBoardRefetchQueries,
  });

  async function handleAdd() {
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    await createTask({
      variables: {
        input: {
          title: title.trim(),
          status: DEFAULT_STATUS,
          dueDate: null,
          assigneeIds: currentUserId ? [currentUserId] : undefined,
          isShared: true,
          projectId: activeBoardId ?? undefined,
        },
      },
    });

    setTitle("");
    setTitleError(false);
  }

  return (
    <div className="px-4 py-3">
      <div className="w-full min-w-0 space-y-1">
        <input
          value={title}
          placeholder="Add a task…"
          disabled={loading}
          onChange={(event) => {
            setTitle(event.target.value);
            if (titleError && event.target.value.trim()) {
              setTitleError(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleAdd();
            }
          }}
          className={cn(inlineFieldInputClass, "font-medium", titleError && "border-error focus:border-error")}
        />
        {titleError && <p className="text-xs text-error">Task name is required.</p>}
      </div>
    </div>
  );
}
