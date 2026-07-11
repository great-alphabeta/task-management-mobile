import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import DownIcon from "@/assets/svg/down.svg";
import UserIcon from "@/assets/svg/user.svg";
import Header from "@/components/Header";
import RoundedButton from "@/components/RoundedButton";
import TaskStatusBadge, { getTaskStatusStyle } from "@/components/TaskStatusBadge";
import { getAllProjects } from "@/db/projects";
import { deleteTask, getTaskById, updateTask } from "@/db/tasks";
import type { Project, TaskGroupId, TaskStatus } from "@/types/database";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";

type ProjectOption = Project & {
  icon: typeof BriefcaseIcon;
  iconColor: string;
  bgColor: string;
};

type StatusOption = {
  value: TaskStatus;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: "to-do" },
  { value: "inprogress" },
  { value: "done" },
];

function getTaskGroupStyle(groupId: TaskGroupId) {
  switch (groupId) {
    case "office_project":
      return {
        icon: BriefcaseIcon,
        iconColor: "#F478B8",
        bgColor: "#FFE4F2",
      };
    case "personal_project":
      return {
        icon: UserIcon,
        iconColor: "#9260F4",
        bgColor: "#E8E1FF",
      };
    case "daily_study":
      return {
        icon: BookIcon,
        iconColor: "#FF9142",
        bgColor: "#FFE6D4",
      };
  }
}

export default function TaskDetail() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("to-do");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTaskDetail = useCallback(async () => {
    const parsedTaskId = Number(taskId);

    if (!parsedTaskId) {
      Alert.alert("Task not found", "This task could not be loaded.");
      router.back();
      return;
    }

    const [task, loadedProjects] = await Promise.all([
      getTaskById(parsedTaskId),
      getAllProjects(),
    ]);

    if (!task) {
      Alert.alert("Task not found", "This task could not be loaded.");
      router.back();
      return;
    }

    const projectOptions = loadedProjects.map((project) => ({
      ...project,
      ...getTaskGroupStyle(project.group_id),
    }));

    const taskProject =
      projectOptions.find((project) => project.project_id === task.project_id) ?? null;

    setProjects(projectOptions);
    setSelectedProject(taskProject);
    setTaskName(task.task_name);
    setDescription(task.task_description);
    setStatus(task.status);
    setIsLoading(false);
  }, [taskId]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadTaskDetail();
    }, [loadTaskDetail]),
  );

  const handleSave = async () => {
    const parsedTaskId = Number(taskId);

    if (!parsedTaskId || !selectedProject) {
      Alert.alert("Missing project", "Please select a project.");
      return;
    }

    const trimmedName = taskName.trim();

    if (!trimmedName) {
      Alert.alert("Missing task name", "Please enter a task name.");
      return;
    }

    setIsSaving(true);

    try {
      await updateTask(parsedTaskId, {
        project_id: selectedProject.project_id,
        task_name: trimmedName,
        task_description: description.trim(),
        status,
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Save failed", "Could not update the task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    const parsedTaskId = Number(taskId);

    if (!parsedTaskId) {
      return;
    }

    Alert.alert("Delete task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);

          try {
            const deleted = await deleteTask(parsedTaskId);

            if (!deleted) {
              Alert.alert("Delete failed", "Could not delete the task. Please try again.");
              return;
            }

            router.back();
          } catch (error) {
            console.error(error);
            Alert.alert("Delete failed", "Could not delete the task. Please try again.");
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const selectedStatus = STATUS_OPTIONS.find((option) => option.value === status) ?? STATUS_OPTIONS[0];

  if (isLoading) {
    return (
      <View className="flex flex-1 gap-xl">
        <Header title="Task Detail" />
      </View>
    );
  }

  return (
    <View className="flex flex-1 gap-xl">
      <Header title="Task Detail" />
      <View className="w-full">
        {projects.length > 0 && selectedProject ? (
          <SelectDropdown
            data={projects}
            onSelect={(selectedItem: ProjectOption) => {
              setSelectedProject(selectedItem);
            }}
            renderButton={() => (
              <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
                <View
                  className="rounded-lg w-[30px] h-[30px] items-center justify-center"
                  style={{ backgroundColor: selectedProject.bgColor }}
                >
                  {selectedProject.logo_uri ? (
                    <Image
                      source={{ uri: selectedProject.logo_uri }}
                      className="w-[30px] h-[30px] rounded-lg"
                    />
                  ) : (
                    <selectedProject.icon width={24} height={24} color={selectedProject.iconColor} />
                  )}
                </View>
                <View className="flex flex-col flex-1">
                  <Text className="text-secondary font-lexend text-sm">Project</Text>
                  <Text className="text-black font-lexend-semibold">{selectedProject.project_name}</Text>
                </View>
                <View>
                  <DownIcon width={24} height={24} color="black" />
                </View>
              </View>
            )}
            renderItem={(project: ProjectOption) => (
              <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
                <View
                  className="rounded-lg w-[30px] h-[30px] items-center justify-center"
                  style={{ backgroundColor: project.bgColor }}
                >
                  {project.logo_uri ? (
                    <Image
                      source={{ uri: project.logo_uri }}
                      className="w-[30px] h-[30px] rounded-lg"
                    />
                  ) : (
                    <project.icon width={24} height={24} color={project.iconColor} />
                  )}
                </View>
                <Text className="text-black font-lexend-semibold w-full">{project.project_name}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View className="flex flex-col gap-sm w-full bg-[#FFFFFF] p-xl rounded-lg shadow-md shadow-black/10">
            <Text className="text-secondary font-lexend text-sm">Project</Text>
            <Text className="font-lexend text-black">No projects available.</Text>
          </View>
        )}
      </View>
      <View className="flex flex-col gap-sm w-full bg-[#FFFFFF] p-xl rounded-lg shadow-md shadow-black/10">
        <Text className="text-secondary font-lexend text-sm">Task Name</Text>
        <TextInput
          cursorColor="#7c3aed"
          value={taskName}
          onChangeText={setTaskName}
          className="font-lexend text-black"
        />
      </View>
      <View className="flex flex-col gap-sm w-full bg-[#FFFFFF] p-xl rounded-lg shadow-md shadow-black/10">
        <Text className="text-secondary font-lexend text-sm">Description</Text>
        <TextInput
          cursorColor="#7c3aed"
          value={description}
          onChangeText={setDescription}
          className="font-lexend text-black text-sm"
          multiline={true}
          numberOfLines={4}
        />
      </View>
      <View className="w-full">
        <SelectDropdown
          data={STATUS_OPTIONS}
          onSelect={(selectedItem: StatusOption) => {
            setStatus(selectedItem.value);
          }}
          renderButton={() => (
            <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
              <View className="flex flex-col flex-1">
                <Text className="text-secondary font-lexend text-sm">Status</Text>
                <Text className="text-black font-lexend-semibold">
                  {getTaskStatusStyle(selectedStatus.value).label}
                </Text>
              </View>
              <View>
                <DownIcon width={24} height={24} color="black" />
              </View>
            </View>
          )}
          renderItem={(option: StatusOption) => (
            <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
              <TaskStatusBadge status={option.value} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <RoundedButton
        text={isSaving ? "Saving..." : "Save Changes"}
        onPress={handleSave}
        disabled={isSaving || isDeleting || projects.length === 0}
      />
      <Pressable onPress={handleDelete} disabled={isSaving || isDeleting}>
        <Text className="text-center font-lexend-semibold text-[#FF4D4F]">
          {isDeleting ? "Deleting..." : "Delete Task"}
        </Text>
      </Pressable>
    </View>
  );
}
