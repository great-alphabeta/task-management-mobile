import type { Project, TaskGroupId } from "@/types/database";
import { formatDateKey } from "@/utils/date";
import { formatReferenceDateLabel, resolveTaskDate } from "@/utils/naturalLanguageDate";
import { AiServiceError, chatCompletion, extractJsonObject } from "./client";
import type { DailySummaryTask, ParsedNaturalLanguageTask, TaskGroupSuggestion } from "./types";

const TASK_GROUPS: TaskGroupId[] = ["office_project", "personal_project", "daily_study"];

function cleanText(text: string): string {
  return text.replace(/^["']|["']$/g, "").trim();
}

function isValidTaskGroupId(value: string): value is TaskGroupId {
  return TASK_GROUPS.includes(value as TaskGroupId);
}

function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

function parseTimeToDate(dateKey: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(`${dateKey}T00:00:00`);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export async function generateProjectDescription(
  projectName: string,
  prompt?: string,
): Promise<string> {
  const content = await chatCompletion([
    {
      role: "system",
      content:
        "You write concise, practical project descriptions for a task management app. Return only the description text, no quotes or headings. Keep it to 2-4 sentences.",
    },
    {
      role: "user",
      content: prompt?.trim()
        ? `Project name: ${projectName}\nUser prompt: ${prompt.trim()}`
        : `Write a useful project description for a project named "${projectName}".`,
    },
  ]);

  return cleanText(content);
}

export async function generateTaskDescription(
  taskName: string,
  projectName?: string,
  prompt?: string,
): Promise<string> {
  const content = await chatCompletion([
    {
      role: "system",
      content:
        "You write concise task descriptions for a task management app. Return only the description text, no quotes or headings. Keep it to 1-3 sentences.",
    },
    {
      role: "user",
      content: [
        `Task name: ${taskName}`,
        projectName ? `Project: ${projectName}` : null,
        prompt?.trim() ? `User prompt: ${prompt.trim()}` : null,
        "Write a clear task description.",
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ]);

  return cleanText(content);
}

export async function improveDescription(
  description: string,
  contextLabel: string,
): Promise<string> {
  const content = await chatCompletion([
    {
      role: "system",
      content:
        "You improve descriptions for a task management app. Make them clearer and more actionable while keeping the same meaning. Return only the improved description.",
    },
    {
      role: "user",
      content: `${contextLabel} description:\n${description}`,
    },
  ]);

  return cleanText(content);
}

export async function summarizeDescription(
  description: string,
  contextLabel: string,
): Promise<string> {
  const content = await chatCompletion([
    {
      role: "system",
      content:
        "You summarize long descriptions for a task management app. Return only the concise summary in 1-2 sentences.",
    },
    {
      role: "user",
      content: `Summarize this ${contextLabel} description:\n${description}`,
    },
  ]);

  return cleanText(content);
}

export async function suggestTaskGroup(
  projectName: string,
  description: string,
): Promise<TaskGroupSuggestion> {
  const content = await chatCompletion([
    {
      role: "system",
      content:
        'Pick the best task group for a project. Respond with JSON only: {"group_id":"office_project|personal_project|daily_study","reason":"short reason"}. office_project = work/professional, personal_project = personal life/errands, daily_study = learning/study/habits.',
    },
    {
      role: "user",
      content: `Project name: ${projectName}\nDescription: ${description || "(empty)"}`,
    },
  ], { temperature: 0.2 });

  const parsed = extractJsonObject<{ group_id?: string; reason?: string }>(content);

  if (!parsed.group_id || !isValidTaskGroupId(parsed.group_id)) {
    throw new AiServiceError("AI could not suggest a valid task group.");
  }

  return {
    group_id: parsed.group_id,
    reason: parsed.reason?.trim() || "Suggested based on the project details.",
  };
}

export async function generateDailySummary(tasks: DailySummaryTask[]): Promise<string> {
  const todayKey = formatDateKey(new Date());

  if (tasks.length === 0) {
    return "You have no tasks scheduled for today. Add one to stay on track.";
  }

  const content = await chatCompletion([
    {
      role: "system",
      content:
        "You write short, helpful daily task summaries for a mobile app home screen. Use 1-2 sentences. Mention how many tasks are due today and call out the most urgent one if possible. Be friendly and direct. Return plain text only.",
    },
    {
      role: "user",
      content: `Today's date: ${todayKey}\nTasks:\n${JSON.stringify(tasks, null, 2)}`,
    },
  ], { maxTokens: 180 });

  return cleanText(content);
}

export async function parseNaturalLanguageTask(
  input: string,
  projects: Project[],
  referenceDateKey: string,
): Promise<ParsedNaturalLanguageTask> {
  const projectNames = projects.map((project) => project.project_name);
  const referenceLabel = formatReferenceDateLabel(referenceDateKey);

  const content = await chatCompletion([
    {
      role: "system",
      content:
        'Parse natural-language task input into JSON only: {"task_name":"","task_description":"","project_name":null,"date":"YYYY-MM-DD","start_time":"HH:mm","end_time":"HH:mm"}. Use 24-hour time. Resolve relative dates from the reference date: "today" = reference date, "tomorrow" = reference date + 1 day, "next Friday" = the next occurrence after the reference date. Resolve month/day phrases like "Jun 30" to YYYY-MM-DD using the reference year unless a year is given. Always output date as YYYY-MM-DD. If no end time is given, set end_time one hour after start_time. If no project is mentioned, use null. project_name must match one of the provided projects when possible.',
    },
    {
      role: "user",
      content: [
        `Reference date: ${referenceLabel}`,
        `Available projects: ${projectNames.length > 0 ? projectNames.join(", ") : "none"}`,
        `Input: ${input.trim()}`,
      ].join("\n"),
    },
  ], { temperature: 0.1 });

  const parsed = extractJsonObject<ParsedNaturalLanguageTask>(content);

  if (!parsed.task_name?.trim()) {
    throw new AiServiceError("AI could not determine a task name from that input.");
  }

  parsed.date = resolveTaskDate(input, referenceDateKey, parsed.date);

  if (!isValidTime(parsed.start_time)) {
    parsed.start_time = "09:00";
  }

  if (!isValidTime(parsed.end_time)) {
    const startDate = parseTimeToDate(parsed.date, parsed.start_time);
    startDate.setHours(startDate.getHours() + 1);
    parsed.end_time = `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}`;
  }

  const startDate = parseTimeToDate(parsed.date, parsed.start_time);
  const endDate = parseTimeToDate(parsed.date, parsed.end_time);

  if (endDate <= startDate) {
    endDate.setHours(startDate.getHours() + 1);
    parsed.end_time = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
  }

  return {
    task_name: parsed.task_name.trim(),
    task_description: parsed.task_description?.trim() || "",
    project_name: parsed.project_name?.trim() || null,
    date: parsed.date,
    start_time: parsed.start_time,
    end_time: parsed.end_time,
  };
}

export function resolveProjectId(
  projectName: string | null,
  projects: Project[],
): number | null {
  if (!projectName || projects.length === 0) {
    return projects[0]?.project_id ?? null;
  }

  const normalized = projectName.trim().toLowerCase();
  const exact = projects.find((project) => project.project_name.toLowerCase() === normalized);
  if (exact) {
    return exact.project_id;
  }

  const partial = projects.find((project) =>
    project.project_name.toLowerCase().includes(normalized)
    || normalized.includes(project.project_name.toLowerCase()),
  );

  return partial?.project_id ?? projects[0]?.project_id ?? null;
}
