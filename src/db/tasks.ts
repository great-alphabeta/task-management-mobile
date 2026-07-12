import type { NewTask, Task, TaskStatus } from "@/types/database";
import { formatDateKey } from "@/utils/date";
import type * as SQLite from "expo-sqlite";
import { executeDatabaseOperation } from "./index";

async function getTaskByIdWithDb(
  db: SQLite.SQLiteDatabase,
  taskId: number,
): Promise<Task | null> {
  return db.getFirstAsync<Task>("SELECT * FROM tasks WHERE task_id = ?", taskId);
}

export async function createTask(task: NewTask): Promise<Task> {
  return executeDatabaseOperation(async (db) => {
    const result = await db.runAsync(
      `INSERT INTO tasks (project_id, task_name, task_description, created_at, date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      task.project_id,
      task.task_name,
      task.task_description,
      task.created_at ?? new Date().toISOString(),
      task.date,
      task.start_time,
      task.end_time,
      task.status,
    );

    const created = await getTaskByIdWithDb(db, result.lastInsertRowId);
    if (!created) {
      throw new Error("Failed to create task");
    }

    return created;
  });
}

export async function getTaskById(taskId: number): Promise<Task | null> {
  return executeDatabaseOperation((db) => getTaskByIdWithDb(db, taskId));
}

export async function getTasksByProjectId(projectId: number): Promise<Task[]> {
  return executeDatabaseOperation((db) =>
    db.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC",
      projectId,
    ),
  );
}

export async function getTasksByDate(date: string): Promise<Task[]> {
  return executeDatabaseOperation(async (db) => {
    const tasks = await db.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE date = ? OR date = '' ORDER BY start_time ASC",
      date,
    );

    return tasks.filter((task) => {
      if (task.date) {
        return task.date === date;
      }

      if (!task.start_time) {
        return false;
      }

      return formatDateKey(new Date(task.start_time)) === date;
    });
  });
}

export async function getAllTasks(): Promise<Task[]> {
  return executeDatabaseOperation((db) =>
    db.getAllAsync<Task>("SELECT * FROM tasks ORDER BY created_at DESC"),
  );
}

export async function getTasksByStatus(status: TaskStatus): Promise<Task[]> {
  return executeDatabaseOperation((db) =>
    db.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC",
      status,
    ),
  );
}

export async function updateTask(
  taskId: number,
  updates: Partial<NewTask>,
): Promise<Task | null> {
  return executeDatabaseOperation(async (db) => {
    const existing = await getTaskByIdWithDb(db, taskId);

    if (!existing) {
      return null;
    }

    const nextTask = {
      project_id: updates.project_id ?? existing.project_id,
      task_name: updates.task_name ?? existing.task_name,
      task_description: updates.task_description ?? existing.task_description,
      created_at: updates.created_at ?? existing.created_at,
      date: updates.date ?? existing.date,
      start_time: updates.start_time ?? existing.start_time,
      end_time: updates.end_time ?? existing.end_time,
      status: updates.status ?? existing.status,
    };

    await db.runAsync(
      `UPDATE tasks
       SET project_id = ?, task_name = ?, task_description = ?, created_at = ?, date = ?, start_time = ?, end_time = ?, status = ?
       WHERE task_id = ?`,
      nextTask.project_id,
      nextTask.task_name,
      nextTask.task_description,
      nextTask.created_at,
      nextTask.date,
      nextTask.start_time,
      nextTask.end_time,
      nextTask.status,
      taskId,
    );

    return getTaskByIdWithDb(db, taskId);
  });
}

export async function updateTaskStatus(
  taskId: number,
  status: TaskStatus,
): Promise<Task | null> {
  return updateTask(taskId, { status });
}

export async function deleteTask(taskId: number): Promise<boolean> {
  return executeDatabaseOperation(async (db) => {
    const result = await db.runAsync("DELETE FROM tasks WHERE task_id = ?", taskId);
    return result.changes > 0;
  });
}
