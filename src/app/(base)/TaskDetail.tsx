import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import CalendarIcon from "@/assets/svg/calendar.svg";
import ClockIcon from "@/assets/svg/clock.svg";
import DownIcon from "@/assets/svg/down.svg";
import UserIcon from "@/assets/svg/user.svg";
import Header from "@/components/Header";
import RoundedButton from "@/components/RoundedButton";
import ScreenBackground from "@/components/ScreenBackground";
import TaskStatusBadge, { getTaskStatusStyle } from "@/components/TaskStatusBadge";
import { getAllProjects } from "@/db/projects";
import { deleteTask, getTaskById, updateTask } from "@/db/tasks";
import type { Project, TaskGroupId, TaskStatus } from "@/types/database";
import { combineDateAndTime, formatDateKey, formatDisplayDate } from "@/utils/date";
import { showAlert } from "@/utils/alert";
import FormDateTimePicker from "@/components/FormDateTimePicker";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
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

function timeFromIso(isoTime: string, fallbackHours: number): Date {
  if (!isoTime) {
    const date = new Date();
    date.setHours(fallbackHours, 0, 0, 0);
    return date;
  }

  return new Date(isoTime);
}

function formatTime(date: Date): string {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TaskDetail() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("to-do");
  const [taskDateKey, setTaskDateKey] = useState(formatDateKey(new Date()));
  const [startTime, setStartTime] = useState(new Date());
  const [startTimePickerShow, setStartTimePickerShow] = useState(false);
  const [endTime, setEndTime] = useState(new Date());
  const [endTimePickerShow, setEndTimePickerShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTaskDetail = useCallback(async () => {
    const parsedTaskId = Number(taskId);

    if (!parsedTaskId) {
      showAlert("Task not found", "This task could not be loaded.");
      router.back();
      return;
    }

    const [task, loadedProjects] = await Promise.all([
      getTaskById(parsedTaskId),
      getAllProjects(),
    ]);

    if (!task) {
      showAlert("Task not found", "This task could not be loaded.");
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

    const dateKey = task.date || (task.start_time
      ? formatDateKey(new Date(task.start_time))
      : formatDateKey(new Date()));
    const loadedStartTime = timeFromIso(task.start_time, 9);
    const loadedEndTime = timeFromIso(task.end_time, loadedStartTime.getHours() + 1);

    setTaskDateKey(dateKey);
    setStartTime(loadedStartTime);
    setEndTime(loadedEndTime);
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
      showAlert("Missing project", "Please select a project.");
      return;
    }

    const trimmedName = taskName.trim();

    if (!trimmedName) {
      showAlert("Missing task name", "Please enter a task name.");
      return;
    }

    if (endTime <= startTime) {
      showAlert("Invalid times", "End time must be after the start time.");
      return;
    }

    setIsSaving(true);

    try {
      await updateTask(parsedTaskId, {
        project_id: selectedProject.project_id,
        task_name: trimmedName,
        task_description: description.trim(),
        date: taskDateKey,
        start_time: combineDateAndTime(taskDateKey, startTime),
        end_time: combineDateAndTime(taskDateKey, endTime),
        status,
      });

      router.back();
    } catch (error) {
      console.error(error);
      showAlert("Save failed", "Could not update the task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    const parsedTaskId = Number(taskId);

    if (!parsedTaskId) {
      return;
    }

    showAlert("Delete task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsDeleting(true);

          try {
            const deleted = await deleteTask(parsedTaskId);

            if (!deleted) {
              showAlert("Delete failed", "Could not delete the task. Please try again.");
              return;
            }

            router.back();
          } catch (error) {
            console.error(error);
            showAlert("Delete failed", "Could not delete the task. Please try again.");
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
      <ScreenBackground>
        <View className="flex flex-1">
          <Header title="Task Detail" />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View className="flex flex-1">
        <Header title="Task Detail" />
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex flex-col gap-xl pb-xl"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
                      className={`${selectedProject.logo_uri ? 'rounded-lg' : 'rounded-full'} w-[30px] h-[30px] items-center justify-center`}
                      style={{ backgroundColor: selectedProject.bgColor }}
                    >
                      {selectedProject.logo_uri ? (
                        <Image
                          source={{ uri: selectedProject.logo_uri }}
                          className="w-[30px] h-[30px] rounded-full"
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
                  <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10">
                    <View
                      className={`${project.logo_uri ? 'rounded-lg' : 'rounded-full'} w-[30px] h-[30px] items-center justify-center`}
                      style={{ backgroundColor: project.bgColor }}
                    >
                      {project.logo_uri ? (
                        <Image
                          source={{ uri: project.logo_uri }}
                          className="w-[30px] h-[30px] rounded-full"
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
          <View className="flex flex-row gap-sm items-center p-lg bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
            <CalendarIcon width={24} height={24} color="#5F33E1" />
            <View className="flex flex-col flex-1">
              <Text className="text-secondary font-lexend text-sm">Date</Text>
              <Text className="text-black font-lexend">{formatDisplayDate(taskDateKey)}</Text>
            </View>
          </View>
          <Pressable onPress={() => setStartTimePickerShow(true)}>
            <View className="flex flex-row gap-sm items-center p-lg bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
              <ClockIcon width={24} height={24} color="#5F33E1" />
              <View className="flex flex-col flex-1">
                <Text className="text-secondary font-lexend text-sm">Start Time</Text>
                <Text className="text-black font-lexend">{formatTime(startTime)}</Text>
              </View>
              <View>
                <DownIcon width={24} height={24} color="black" />
              </View>
            </View>
          </Pressable>
          <Pressable onPress={() => setEndTimePickerShow(true)}>
            <View className="flex flex-row gap-sm items-center p-lg bg-[#FFFFFF] shadow-md shadow-black/10 rounded-lg">
              <ClockIcon width={24} height={24} color="#5F33E1" />
              <View className="flex flex-col flex-1">
                <Text className="text-secondary font-lexend text-sm">End Time</Text>
                <Text className="text-black font-lexend">{formatTime(endTime)}</Text>
              </View>
              <View>
                <DownIcon width={24} height={24} color="black" />
              </View>
            </View>
          </Pressable>
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
                <View className="flex flex-row gap-sm items-center p-xl bg-[#FFFFFF] shadow-md shadow-black/10">
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
        </ScrollView>
        <FormDateTimePicker
          visible={startTimePickerShow}
          testID="startTimePicker"
          value={startTime}
          mode="time"
          onConfirm={setStartTime}
          onClose={() => setStartTimePickerShow(false)}
        />
        <FormDateTimePicker
          visible={endTimePickerShow}
          testID="endTimePicker"
          value={endTime}
          mode="time"
          onConfirm={setEndTime}
          onClose={() => setEndTimePickerShow(false)}
        />
      </View>
    </ScreenBackground>
  );
}
