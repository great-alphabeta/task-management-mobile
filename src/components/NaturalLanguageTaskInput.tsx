import { isAiConfigured } from "@/config/ai";
import { createTask } from "@/db/tasks";
import {
  AiServiceError,
  parseNaturalLanguageTask,
  resolveProjectId,
} from "@/services/ai";
import type { Project } from "@/types/database";
import { showAlert } from "@/utils/alert";
import { combineDateAndTime, formatDisplayDate } from "@/utils/date";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

type NaturalLanguageTaskInputProps = {
  projects: Project[];
  defaultDateKey: string;
  onTaskCreated: (createdDateKey: string) => void;
};

export default function NaturalLanguageTaskInput({
  projects,
  defaultDateKey,
  onTaskCreated,
}: NaturalLanguageTaskInputProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const aiEnabled = isAiConfigured();

  if (!aiEnabled) {
    return null;
  }

  const handleCreate = async () => {
    const trimmed = input.trim();

    if (!trimmed) {
      showAlert("Enter a task", 'Try something like "Design review tomorrow at 3pm".');
      return;
    }

    if (projects.length === 0) {
      showAlert("No projects", "Create a project before adding tasks.");
      return;
    }

    setIsLoading(true);

    try {
      const parsed = await parseNaturalLanguageTask(trimmed, projects, defaultDateKey);
      const projectId = resolveProjectId(parsed.project_name, projects);

      if (!projectId) {
        throw new AiServiceError("No project available to attach this task to.");
      }

      const [startHours, startMinutes] = parsed.start_time.split(":").map(Number);
      const [endHours, endMinutes] = parsed.end_time.split(":").map(Number);
      const startTime = new Date();
      startTime.setHours(startHours, startMinutes, 0, 0);
      const endTime = new Date();
      endTime.setHours(endHours, endMinutes, 0, 0);

      await createTask({
        project_id: projectId,
        task_name: parsed.task_name,
        task_description: parsed.task_description,
        date: parsed.date,
        start_time: combineDateAndTime(parsed.date, startTime),
        end_time: combineDateAndTime(parsed.date, endTime),
        status: "to-do",
      });

      setInput("");
      onTaskCreated(parsed.date);
      showAlert(
        "Task created",
        `"${parsed.task_name}" was scheduled for ${formatDisplayDate(parsed.date)}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create the task.";
      showAlert("AI task creation failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex flex-col gap-sm w-full bg-[#FFFFFF] p-xl rounded-lg shadow-md shadow-black/10">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-secondary font-lexend text-sm">Quick add with AI</Text>
        {isLoading ? <ActivityIndicator size="small" color="#5F33E1" /> : null}
      </View>
      <TextInput
        cursorColor="#7c3aed"
        value={input}
        onChangeText={setInput}
        className="font-lexend text-black text-sm"
        placeholder='e.g. "Design review tomorrow at 3pm"'
        editable={!isLoading}
      />
      <Pressable
        onPress={handleCreate}
        disabled={isLoading}
        className="bg-[#EDE8FF] rounded-lg px-md py-sm self-start"
        style={{ opacity: isLoading ? 0.6 : 1 }}
      >
        <Text className="text-primary font-lexend-semibold text-sm">Create task with AI</Text>
      </Pressable>
    </View>
  );
}
