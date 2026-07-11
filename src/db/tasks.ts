import type { NewTask, Task, TaskStatus } from "@/types/database";
import { getDatabase } from "./index";

export async function createTask(task: NewTask): Promise<Task> {
  const db = await getDatabase();

  const result = await db.runAsync(
    `INSERT INTO tasks (project_id, task_name, task_description, created_at, status)
     VALUES (?, ?, ?, ?, ?)`,
    task.project_id,
    task.task_name,
    task.task_description,
    task.created_at ?? new Date().toISOString(),
    task.status,
  );

  const created = await getTaskById(result.lastInsertRowId);
  if (!created) {
    throw new Error("Failed to create task");
  }

  return created;
}

export async function getTaskById(taskId: number): Promise<Task | null> {
  const db = await getDatabase();

  return db.getFirstAsync<Task>("SELECT * FROM tasks WHERE task_id = ?", taskId);
}

export async function getTasksByProjectId(projectId: number): Promise<Task[]> {
  const db = await getDatabase();

  return db.getAllAsync<Task>(
    "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
    projectId,
  );
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDatabase();

  return db.getAllAsync<Task>("SELECT * FROM tasks ORDER BY created_at DESC");
}

export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  const db = await getDatabase();

  return db.getAllAsync<Task>(
    "SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC",
    status,
  );
}

export async function updateTask(
  taskId: number,
  updates: Partial<NewTask>,
): Promise<Task | null> {
  const db = await getDatabase();
  const existing = await getTaskById(taskId);

  if (!existing) {
    return null;
  }

  const nextTask = {
    project_id: updates.project_id ?? existing.project_id,
    task_name: updates.task_name ?? existing.task_name,
    task_description: updates.task_description ?? existing.task_description,
    created_at: updates.created_at ?? existing.created_at,
    status: updates.status ?? existing.status,
  };

  await db.runAsync(
    `UPDATE tasks
     SET project_id = ?, task_name = ?, task_description = ?, created_at = ?, status = ?
     WHERE task_id = ?`,
    nextTask.project_id,
    nextTask.task_name,
    nextTask.task_description,
    nextTask.created_at,
    nextTask.status,
    taskId,
  );

  return getTaskById(taskId);
}

export async function updateTaskStatus(
  taskId: number,
  status: TaskStatus,
): Promise<Task | null> {
  return updateTask(taskId, { status });
}

export async function deleteTask(taskId: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync("DELETE FROM tasks WHERE task_id = ?", taskId);

  return result.changes > 0;
}
