import type { NewProject, Project, TaskGroupId } from "@/types/database";
import { getDatabase } from "./index";

export async function createProject(project: NewProject): Promise<Project> {
  const db = await getDatabase();

  const result = await db.runAsync(
    `INSERT INTO projects (group_id, project_name, project_description, start_date, end_date, logo_uri)
     VALUES (?, ?, ?, ?, ?, ?)`,
    project.group_id,
    project.project_name,
    project.project_description,
    project.start_date,
    project.end_date,
    project.logo_uri ?? "",
  );

  const created = await getProjectById(result.lastInsertRowId);
  if (!created) {
    throw new Error("Failed to create project");
  }

  return created;
}

export async function getProjectById(projectId: number): Promise<Project | null> {
  const db = await getDatabase();

  return db.getFirstAsync<Project>(
    "SELECT * FROM projects WHERE project_id = ?",
    projectId,
  );
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDatabase();

  return db.getAllAsync<Project>("SELECT * FROM projects ORDER BY start_date DESC");
}

export async function getProjectsByGroupId(groupId: TaskGroupId): Promise<Project[]> {
  const db = await getDatabase();

  return db.getAllAsync<Project>(
    "SELECT * FROM projects WHERE group_id = ? ORDER BY start_date DESC",
    groupId,
  );
}

export async function updateProject(
  projectId: number,
  updates: Partial<NewProject>,
): Promise<Project | null> {
  const db = await getDatabase();
  const existing = await getProjectById(projectId);

  if (!existing) {
    return null;
  }

  const nextProject: NewProject = {
    group_id: updates.group_id ?? existing.group_id,
    project_name: updates.project_name ?? existing.project_name,
    project_description: updates.project_description ?? existing.project_description,
    start_date: updates.start_date ?? existing.start_date,
    end_date: updates.end_date ?? existing.end_date,
    logo_uri: updates.logo_uri !== undefined ? updates.logo_uri : existing.logo_uri,
  };

  await db.runAsync(
    `UPDATE projects
     SET group_id = ?, project_name = ?, project_description = ?, start_date = ?, end_date = ?, logo_uri = ?
     WHERE project_id = ?`,
    nextProject.group_id,
    nextProject.project_name,
    nextProject.project_description,
    nextProject.start_date,
    nextProject.end_date,
    nextProject.logo_uri ?? "",
    projectId,
  );

  return getProjectById(projectId);
}

export async function deleteProject(projectId: number): Promise<boolean> {
  const db = await getDatabase();
  const result = await db.runAsync("DELETE FROM projects WHERE project_id = ?", projectId);

  return result.changes > 0;
}
