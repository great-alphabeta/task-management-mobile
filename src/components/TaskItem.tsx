import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import ClockIcon from "@/assets/svg/clock.svg";
import TaskStatusBadge from "@/components/TaskStatusBadge";
import type { TaskStatus } from "@/types/database";
import { Pressable, Text, View } from "react-native";

function toTaskStatus(status: "todo" | "in_progress" | "done"): TaskStatus {
  if (status === "todo") {
    return "to-do";
  }

  if (status === "in_progress") {
    return "inprogress";
  }

  return "done";
}

export default function TaskItem({
  project_name = "Project 1",
  task_name = "Task 1",
  status = "todo",
  time = "10:00 AM",
  onPress,
}: {
  project_name: string;
  task_name: string;
  status: "todo" | "in_progress" | "done";
  time?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-col gap-sm bg-[#FFFFFF] rounded-2xl p-lg shadow-md shadow-black/10">
        <View className="flex flex-row justify-between items-center">
          <Text className="font-lexend text-sm text-secondary">{project_name}</Text>
          <View className="w-[24px] h-[24px] bg-[#FFE4F2] rounded-md items-center justify-center">
            <BriefcaseIcon color="#F478B8" width={14} height={14} />
          </View>
        </View>
        <Text className="font-lexend text-black">{task_name}</Text>
        <View className="flex flex-row items-center gap-sm">
          <View className="flex-1 flex flex-row items-center gap-sm">
            <ClockIcon color="#AB94FF" width={14} height={14} />
            <Text className="font-lexend text-sm text-[#AB94FF]">{time}</Text>
          </View>
          <TaskStatusBadge status={toTaskStatus(status)} />
        </View>
      </View>
    </Pressable>
  );
}
