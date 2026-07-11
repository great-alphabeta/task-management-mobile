import CalendarItem from "@/components/CalendarItem";
import Header from "@/components/Header";
import RoundedButton from "@/components/RoundedButton";
import ScreenBackground from "@/components/ScreenBackground";
import TaskItem from "@/components/TaskItem";
import { getAllProjects } from "@/db/projects";
import { getTasksByDate } from "@/db/tasks";
import { setSelectedTaskDate } from "@/store/selectedTaskDate";
import type { Project, Task, TaskStatus } from "@/types/database";
import { formatDateKey, isSameDay } from "@/utils/date";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

type TaskFilter = "All" | "To do" | "In Progress" | "Done";

function toTaskItemStatus(status: TaskStatus): "todo" | "in_progress" | "done" {
  if (status === "to-do") {
    return "todo";
  }

  if (status === "inprogress") {
    return "in_progress";
  }

  return "done";
}

function toFilterStatus(filter: TaskFilter): TaskStatus | null {
  if (filter === "To do") {
    return "to-do";
  }

  if (filter === "In Progress") {
    return "inprogress";
  }

  if (filter === "Done") {
    return "done";
  }

  return null;
}

function formatTaskTime(isoTime: string): string {
  if (!isoTime) {
    return "";
  }

  return new Date(isoTime).toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TodayTask() {
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("All");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectsById, setProjectsById] = useState<Record<number, Project>>({});

  const calendarDates = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index - 2);
        return date;
      }),
    [],
  );

  const loadTasks = useCallback(async () => {
    const [tasksForDate, projects] = await Promise.all([
      getTasksByDate(formatDateKey(selectedDate)),
      getAllProjects(),
    ]);

    setTasks(tasksForDate);
    setProjectsById(
      Object.fromEntries(projects.map((project) => [project.project_id, project])),
    );
  }, [selectedDate]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedTaskDate(date);
  };

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useFocusEffect(
    useCallback(() => {
      setSelectedTaskDate(selectedDate);
      loadTasks();
    }, [loadTasks, selectedDate]),
  );

  const filteredTasks = tasks.filter((task) => {
    const filterStatus = toFilterStatus(activeFilter);
    return filterStatus ? task.status === filterStatus : true;
  });

  const emptyMessage = activeFilter === "All"
    ? "No tasks for this day."
    : `No ${activeFilter.toLowerCase()} tasks for this day.`;

  return (
    <ScreenBackground>
      <View className="flex flex-1 flex-col gap-lg">
      <Header title="Today's Task" />
      <View className="w-full flex flex-1 flex-col gap-md">
        <View className="flex flex-row gap-sm justify-between">
          {calendarDates.map((date) => (
            <CalendarItem
              key={formatDateKey(date)}
              date={date}
              selected={isSameDay(date, selectedDate)}
              onPress={() => handleSelectDate(date)}
            />
          ))}
        </View>
        <View className="flex flex-row gap-sm">
          {(["All", "To do", "In Progress", "Done"] as TaskFilter[]).map((text) => (
            <RoundedButton
              key={text}
              text={text}
              isFullWidth={false}
              size="sm"
              className="px-xl py-sm"
              primary={text === activeFilter}
              onPress={() => setActiveFilter(text)}
            />
          ))}
        </View>
        <ScrollView className="flex-1" contentContainerClassName="flex flex-col gap-md pb-[100px]" showsVerticalScrollIndicator={false}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.task_id}
                project_name={projectsById[task.project_id]?.project_name ?? "Unknown Project"}
                task_name={task.task_name}
                status={toTaskItemStatus(task.status)}
                time={formatTaskTime(task.start_time)}
                onPress={() =>
                  router.push({
                    pathname: "/(base)/TaskDetail",
                    params: { taskId: String(task.task_id) },
                  })
                }
              />
            ))
          ) : (
            <Text className="font-lexend text-secondary text-sm">{emptyMessage}</Text>
          )}
        </ScrollView>
      </View>
      </View>
    </ScreenBackground>
  );
}
