import type { TaskGroupId } from "@/types/database";

export function getTaskGroupTitle(groupId: TaskGroupId): string {
  switch (groupId) {
    case "office_project":
      return "Office Project";
    case "personal_project":
      return "Personal Project";
    case "daily_study":
      return "Daily Study";
  }
}
