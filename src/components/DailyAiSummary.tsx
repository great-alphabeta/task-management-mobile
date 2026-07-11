import { isAiConfigured } from "@/config/ai";
import { getAllProjects } from "@/db/projects";
import { getTasksByDate } from "@/db/tasks";
import { generateDailySummary, type DailySummaryTask } from "@/services/ai";
import { formatDateKey } from "@/utils/date";
import { useCallback, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

function formatTaskTime(isoTime: string): string {
  if (!isoTime) {
    return "No time set";
  }

  return new Date(isoTime).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildFallbackSummary(taskCount: number): string {
  if (taskCount === 0) {
    return "You have no tasks scheduled for today. Add one to stay on track.";
  }

  if (taskCount === 1) {
    return "You have 1 task due today.";
  }

  return `You have ${taskCount} tasks due today.`;
}

export function useDailyAiSummary() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    const todayKey = formatDateKey(new Date());

    try {
      const [tasks, projects] = await Promise.all([
        getTasksByDate(todayKey),
        getAllProjects(),
      ]);

      const projectsById = Object.fromEntries(
        projects.map((project) => [project.project_id, project]),
      );

      if (!isAiConfigured()) {
        setSummary(buildFallbackSummary(tasks.length));
        return;
      }

      setIsLoading(true);

      const summaryTasks: DailySummaryTask[] = tasks
        .filter((task) => task.status !== "done")
        .map((task) => ({
          task_name: task.task_name,
          project_name: projectsById[task.project_id]?.project_name ?? "Unknown Project",
          status: task.status,
          start_time: formatTaskTime(task.start_time),
        }));
      
      console.log(summaryTasks);

      const aiSummary = await generateDailySummary(summaryTasks);
      setSummary(aiSummary);
    } catch {
      const tasks = await getTasksByDate(todayKey);
      setSummary(buildFallbackSummary(tasks.length));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { summary, isLoading, loadSummary };
}

export function DailyAiSummaryText({
  summary,
  isLoading,
}: {
  summary: string | null;
  isLoading: boolean;
}) {
  if (isLoading && !summary) {
    return (
      <View className="flex flex-row items-center gap-sm">
        <ActivityIndicator size="small" color="#FFFFFF" />
        <Text className="font-lexend text-white text-sm">Preparing your daily summary...</Text>
      </View>
    );
  }

  return (
    <Text className="font-lexend text-white">
      {summary ?? "Your today's tasks are ready to review."}
    </Text>
  );
}
