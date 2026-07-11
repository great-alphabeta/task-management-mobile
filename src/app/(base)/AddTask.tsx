import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import ClockIcon from "@/assets/svg/clock.svg";
import DownIcon from "@/assets/svg/down.svg";
import UserIcon from "@/assets/svg/user.svg";
import Header from "@/components/Header";
import RoundedButton from "@/components/RoundedButton";
import { getAllProjects } from "@/db/projects";
import { createTask } from "@/db/tasks";
import { getSelectedTaskDateKey } from "@/store/selectedTaskDate";
import type { Project, TaskGroupId } from "@/types/database";
import { combineDateAndTime, formatDisplayDate } from "@/utils/date";
import DateTimePicker from "@react-native-community/datetimepicker";
import CalendarIcon from "@/assets/svg/calendar.svg";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, Pressable, Text, TextInput, View } from "react-native";
import SelectDropdown from "react-native-select-dropdown";

type ProjectOption = Project & {
  icon: typeof BriefcaseIcon;
  iconColor: string;
  bgColor: string;
};

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

function createDefaultTime(hours: number, minutes = 0) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTime(date: Date) {
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function AddTask() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(createDefaultTime(9));
  const [startTimePickerShow, setStartTimePickerShow] = useState(false);
  const [endTime, setEndTime] = useState(createDefaultTime(10));
  const [endTimePickerShow, setEndTimePickerShow] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taskDateKey] = useState(getSelectedTaskDateKey());

  const loadProjects = useCallback(async () => {
    const loadedProjects = await getAllProjects();
    const projectOptions = loadedProjects.map((project) => ({
      ...project,
      ...getTaskGroupStyle(project.group_id),
    }));

    setProjects(projectOptions);
    setSelectedProject((current) => {
      if (!current) {
        return projectOptions[0] ?? null;
      }

      return projectOptions.find((project) => project.project_id === current.project_id) ?? projectOptions[0] ?? null;
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects]),
  );

  const handleAddTask = async () => {
    if (!selectedProject) {
      Alert.alert("No project found", "Please create a project before adding a task.");
      return;
    }

    const trimmedName = taskName.trim();

    if (!trimmedName) {
      Alert.alert("Missing task name", "Please enter a task name.");
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Invalid times", "End time must be after the start time.");
      return;
    }

    setIsSaving(true);

    try {
      await createTask({
        project_id: selectedProject.project_id,
        task_name: trimmedName,
        task_description: description.trim(),
        date: taskDateKey,
        start_time: combineDateAndTime(taskDateKey, startTime),
        end_time: combineDateAndTime(taskDateKey, endTime),
        status: "to-do",
      });

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Save failed", "Could not save the task. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="flex flex-1 gap-xl">
      <Header title="Add Task" />
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
            <Text className="font-lexend text-black">No projects available. Create a project first.</Text>
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
      <RoundedButton
        text={isSaving ? "Saving..." : "Add Task"}
        onPress={handleAddTask}
        disabled={isSaving || projects.length === 0}
      />
      {startTimePickerShow && (
        <DateTimePicker
          testID="startTimePicker"
          value={startTime}
          mode="time"
          onValueChange={(_event, selectedTime) => {
            if (selectedTime) {
              setStartTime(selectedTime);
            }
            setStartTimePickerShow(false);
          }}
          onDismiss={() => setStartTimePickerShow(false)}
        />
      )}
      {endTimePickerShow && (
        <DateTimePicker
          testID="endTimePicker"
          value={endTime}
          mode="time"
          onValueChange={(_event, selectedTime) => {
            if (selectedTime) {
              setEndTime(selectedTime);
            }
            setEndTimePickerShow(false);
          }}
          onDismiss={() => setEndTimePickerShow(false)}
        />
      )}
    </View>
  );
}
