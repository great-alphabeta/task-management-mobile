import { formatDateKey } from "@/utils/date";

let selectedTaskDate = formatDateKey(new Date());

export function getSelectedTaskDateKey(): string {
  return selectedTaskDate;
}

export function setSelectedTaskDate(date: Date): void {
  selectedTaskDate = formatDateKey(date);
}
