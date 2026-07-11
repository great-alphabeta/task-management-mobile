import NotificationIcon from "@/assets/svg/notification.svg";
import ProjectItem from "@/components/ProjectItem";
import RoundedButton from "@/components/RoundedButton";
import TaskGroupItem from "@/components/TaskGroupItem";
import { getAllProjects } from "@/db/projects";
import { getAllTasks } from "@/db/tasks";
import type { Project, Task, TaskGroupId } from "@/types/database";
import { CircularProgressIndicator, Host } from '@expo/ui/jetpack-compose';
import { graphicsLayer, size } from '@expo/ui/jetpack-compose/modifiers';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

const PROGRESS_SIZE = 76;

const TASK_GROUP_ORDER: TaskGroupId[] = [
  "office_project",
  "personal_project",
  "daily_study",
];

type InProgressProject = Project & {
  completed: number;
};

type TaskGroupSummary = {
  groupId: TaskGroupId;
  task_count: number;
  completed: number;
};

function getProjectCompletion(tasks: Task[]): number {
  if (tasks.length === 0) {
    return 0;
  }

  const doneCount = tasks.filter((task) => task.status === "done").length;
  return doneCount / tasks.length;
}

function buildHomeData(projects: Project[], tasks: Task[]) {
  const tasksByProjectId = new Map<number, Task[]>();

  for (const task of tasks) {
    const projectTasks = tasksByProjectId.get(task.project_id) ?? [];
    projectTasks.push(task);
    tasksByProjectId.set(task.project_id, projectTasks);
  }

  const inProgressProjects = projects
    .filter((project) => {
      const projectTasks = tasksByProjectId.get(project.project_id) ?? [];
      return projectTasks.some(
        (task) => task.status === "inprogress" || task.status === "to-do",
      );
    })
    .map((project) => ({
      ...project,
      completed: getProjectCompletion(tasksByProjectId.get(project.project_id) ?? []),
    }));

  const projectsById = new Map(projects.map((project) => [project.project_id, project]));
  const taskGroupMap = new Map<TaskGroupId, { total: number; done: number }>();

  for (const task of tasks) {
    const project = projectsById.get(task.project_id);
    if (!project) {
      continue;
    }

    const current = taskGroupMap.get(project.group_id) ?? { total: 0, done: 0 };
    current.total += 1;
    if (task.status === "done") {
      current.done += 1;
    }
    taskGroupMap.set(project.group_id, current);
  }

  const taskGroups: TaskGroupSummary[] = TASK_GROUP_ORDER.flatMap((groupId) => {
    const stats = taskGroupMap.get(groupId);
    if (!stats || stats.total === 0) {
      return [];
    }

    return [{
      groupId,
      task_count: stats.total,
      completed: stats.done / stats.total,
    }];
  });

  const overallProgress = tasks.length === 0
    ? 0
    : tasks.filter((task) => task.status === "done").length / tasks.length;

  return {
    inProgressProjects,
    taskGroups,
    overallProgress,
  };
}

export default function Home() {
  const [inProgressProjects, setInProgressProjects] = useState<InProgressProject[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroupSummary[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const loadHomeData = useCallback(async () => {
    const [projects, tasks] = await Promise.all([
      getAllProjects(),
      getAllTasks(),
    ]);

    const homeData = buildHomeData(projects, tasks);
    setInProgressProjects(homeData.inProgressProjects);
    setTaskGroups(homeData.taskGroups);
    setOverallProgress(homeData.overallProgress);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData]),
  );

  return (
    <View className="flex flex-1 gap-xl">
      <View className="flex flex-row gap-lg items-center justify-center">
        <Image source={require("@/assets/images/avatar.png")} className="w-[48px] h-[48px] rounded-full" />
        <View className="flex-1">
          <Text className="font-lexend">Hello!</Text>
          <Text className="text-lg font-lexend-semibold ">Livia Vaccaro</Text>
        </View>
        <View>
          <NotificationIcon />
          <View className="w-[8px] h-[8px] rounded-full bg-primary absolute top-0 right-[3px]" />
        </View>
      </View>
      <View className="bg-primary rounded-xl p-xl flex flex-row gap-2xl items-center">
        <View className="flex flex-col gap-xl w-1/2">
          <Text className="font-lexend text-white">Your today’s task{"\n"}almost done!</Text>
          <RoundedButton text="View Task" primary={false} className="px-[20px] py-[10px]" size="sm" />
        </View>
        <View
          style={{ width: PROGRESS_SIZE, height: PROGRESS_SIZE }}
        >
          <Host matchContents>
            <CircularProgressIndicator
              progress={overallProgress}
              color="#EEE9FF"
              trackColor="#8764FF"
              gapSize={0}
              strokeWidth={8}
              modifiers={[size(PROGRESS_SIZE, PROGRESS_SIZE), graphicsLayer({ scaleX: -1 })]}
            />
          </Host>
          <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
            <Text className="font-lexend-semibold text-white text-sm">
              {Math.round(overallProgress * 100)}%
            </Text>
          </View>
        </View>
        <View className="bg-[#FFFFFF40] rounded-lg absolute top-lg right-lg w-[20px] h-[20px]">
          <MaterialIcons name="more-horiz" size={20} color="#FFFFFF" />
        </View>
      </View>
      <View className="flex flex-col gap-lg">
        <View className="flex flex-row items-end justify-between">
          <Text className="font-lexend-semibold text-lg">In Progress</Text>
          <Text className="font-lexend text-secondary">{inProgressProjects.length}</Text>
        </View>
        {inProgressProjects.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex flex-row gap-lg">
              {inProgressProjects.map((project) => (
                <ProjectItem
                  key={project.project_id}
                  name={project.project_name}
                  type={project.group_id}
                  completed={project.completed}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text className="font-lexend text-secondary text-sm">No in-progress projects yet.</Text>
        )}
        {taskGroups.map((group) => (
          <TaskGroupItem
            key={group.groupId}
            type={group.groupId}
            task_count={group.task_count}
            completed={group.completed}
          />
        ))}
      </View>
    </View>
  );
}
