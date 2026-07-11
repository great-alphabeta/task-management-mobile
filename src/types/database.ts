export type TaskGroupId = "office_project" | "personal_project" | "daily_study";

export type TaskStatus = "to-do" | "inprogress" | "done";

export type Project = {
  project_id: number;
  group_id: TaskGroupId;
  project_name: string;
  project_description: string;
  start_date: string;
  end_date: string;
  logo_uri: string | null;
};

export type Task = {
  task_id: number;
  project_id: number;
  task_name: string;
  task_description: string;
  created_at: string;
  status: TaskStatus;
};

export type NewProject = Omit<Project, "project_id">;

export type NewTask = Omit<Task, "task_id" | "created_at"> & {
  created_at?: string;
};
