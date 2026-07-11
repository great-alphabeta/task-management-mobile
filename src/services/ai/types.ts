import type { TaskGroupId } from "@/types/database";

export type TaskGroupSuggestion = {
  group_id: TaskGroupId;
  reason: string;
};

export type ParsedNaturalLanguageTask = {
  task_name: string;
  task_description: string;
  project_name: string | null;
  date: string;
  start_time: string;
  end_time: string;
};

export type DailySummaryTask = {
  task_name: string;
  project_name: string;
  status: string;
  start_time: string;
};
