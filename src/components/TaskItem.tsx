import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import ClockIcon from "@/assets/svg/clock.svg";
import UserIcon from "@/assets/svg/user.svg";
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
  type = "office_project",
  onPress,
}: {
  project_name: string;
  task_name: string;
  status: "todo" | "in_progress" | "done";
  time?: string;
  type: "office_project" | "personal_project" | "daily_study";
  onPress?: () => void;
}) {
  const backgroundColor = type === "office_project" ? "#FFE4F2" : type === "personal_project" ? "#EDE4FF" : "#FFE6D4";
  const iconColor = type === "office_project" ? "#F478B8" : type === "personal_project" ? "#9260F4" : "#FF9142";
  const icon = type === "office_project" ? <BriefcaseIcon color={iconColor} width={20} height={20} /> : type === "personal_project" ? <UserIcon color={iconColor} width={20} height={20} /> : <BookIcon color={iconColor} width={20} height={20} />;
  return (
    <Pressable onPress={onPress}>
      <View className="flex flex-col gap-sm bg-[#FFFFFF] rounded-2xl p-lg shadow-md shadow-black/10">
        <View className="flex flex-row justify-between items-center">
          <Text className="font-lexend text-sm text-secondary">{project_name}</Text>
          <View className="w-[24px] h-[24px] rounded-md items-center justify-center" style={{ backgroundColor: backgroundColor }}>
            {icon}
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
