-- Restore backlog status for kanban column.
ALTER TYPE "TaskStatus" ADD VALUE IF NOT EXISTS 'BACKLOG' BEFORE 'TODO';
