"use client";

import { useMutation, useQuery } from "@apollo/client";
import { formatShortDate } from "@life/shared";
import { Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useTaskComments, type TaskCommentsTarget } from "@/components/tasks/task-comments-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ADD_TASK_COMMENT_MUTATION,
  DELETE_TASK_COMMENT_MUTATION,
  MARK_TASK_COMMENTS_READ_MUTATION,
  TASK_COMMENTS_QUERY,
} from "@/graphql";
import type { TaskCommentsQuery, TaskCommentsQueryVariables } from "@/graphql";
import { linkifyText } from "@/lib/linkify";
import { tasksBoardRefetchQueries } from "@/lib/task-board-queries";
import { cn } from "@/lib/cn";

function formatCommentTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (isToday) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }

  return formatShortDate(iso);
}

const SIDEBAR_TRANSITION_MS = 300;

export function TaskCommentsSidebar() {
  const { activeTask, closeComments } = useTaskComments();
  const [body, setBody] = useState("");
  const [heldTask, setHeldTask] = useState<TaskCommentsTarget | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const wasOpenRef = useRef(false);

  const panelTask = activeTask ?? heldTask;

  useEffect(() => {
    if (activeTask) {
      setHeldTask(activeTask);
      return;
    }

    const timer = window.setTimeout(() => setHeldTask(null), SIDEBAR_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [activeTask]);

  useEffect(() => {
    if (activeTask) {
      if (!wasOpenRef.current) {
        setIsVisible(false);
        const frame = requestAnimationFrame(() => {
          requestAnimationFrame(() => setIsVisible(true));
        });
        wasOpenRef.current = true;
        return () => cancelAnimationFrame(frame);
      }
      return;
    }

    wasOpenRef.current = false;
    setIsVisible(false);
  }, [activeTask]);

  useEffect(() => {
    if (!activeTask) {
      setBody("");
    }
  }, [activeTask]);

  const { data, loading, refetch } = useQuery<TaskCommentsQuery, TaskCommentsQueryVariables>(
    TASK_COMMENTS_QUERY,
    {
      skip: !panelTask,
      variables: { taskId: panelTask?.id ?? "" },
      fetchPolicy: "network-only",
    },
  );

  const refetchOptions = { refetchQueries: tasksBoardRefetchQueries, awaitRefetchQueries: true };

  const [markRead] = useMutation(MARK_TASK_COMMENTS_READ_MUTATION, refetchOptions);
  const [addComment, { loading: posting }] = useMutation(ADD_TASK_COMMENT_MUTATION, refetchOptions);
  const [deleteComment] = useMutation(DELETE_TASK_COMMENT_MUTATION, refetchOptions);

  useEffect(() => {
    if (!activeTask) {
      return;
    }

    void markRead({ variables: { taskId: activeTask.id } });
    void refetch();
  }, [activeTask, markRead, refetch]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!panelTask) {
      return;
    }

    const trimmed = body.trim();
    if (!trimmed) {
      return;
    }

    await addComment({
      variables: { taskId: panelTask.id, body: trimmed },
    });
    setBody("");
    await refetch();
  }

  if (!panelTask) {
    return null;
  }

  const comments = data?.taskComments ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close comments"
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={closeComments}
      />

      <aside
        className={cn(
          "relative flex h-full w-full max-w-md flex-col border-l border-border-subtle bg-surface shadow-[0_12px_24px_rgba(0,0,0,0.12)]",
          "transition-transform duration-300 ease-out",
          isVisible ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Comments</p>
            <h2 className="truncate text-lg font-semibold text-text-main">{panelTask.title}</h2>
          </div>
          <button
            type="button"
            onClick={closeComments}
            className="rounded-lg p-1 text-text-muted hover:bg-background"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {loading && comments.length === 0 ? (
            <p className="text-sm text-text-muted">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-text-muted">No comments yet. Add details, links, or updates below.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="group/comment space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar
                        name={comment.author.name}
                        email={comment.author.email}
                        image={comment.author.image}
                        className="h-7 w-7 shrink-0 text-[10px]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-main">
                          {comment.author.name ?? comment.author.email}
                        </p>
                        <p className="text-xs text-text-muted">{formatCommentTime(comment.createdAt)}</p>
                      </div>
                    </div>
                    {comment.canDelete ? (
                      <button
                        type="button"
                        onClick={() =>
                          void deleteComment({ variables: { id: comment.id } }).then(() => refetch())
                        }
                        className="rounded p-1 text-text-muted opacity-0 transition hover:bg-background hover:text-error group-hover/comment:opacity-100"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap break-words pl-9 text-sm leading-relaxed text-text-main">
                    {linkifyText(comment.body)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={(event) => void handleSubmit(event)} className="border-t border-border-subtle p-4">
          <label className="sr-only" htmlFor="task-comment-body">
            Add a comment
          </label>
          <textarea
            id="task-comment-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a comment…"
            rows={3}
            className={cn(
              "mb-3 w-full resize-none rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none",
              "focus:border-primary",
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={posting || !body.trim()} className="px-4 py-2 text-sm">
              {posting ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}
