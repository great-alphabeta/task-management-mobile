import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import ClockIcon from "@/assets/svg/clock.svg";
import { Text, View } from "react-native";

export default function TaskItem({
  project_name = "Project 1",
  task_name = "Task 1",
  status = "todo",
}: {
  project_name: string;
  task_name: string;
  status: "todo" | "in_progress" | "done";
}) {
  const status_text = status === "todo" ? "To-do" : status === "in_progress" ? "In Progress" : "Done";
  return (
    <View className="flex flex-col gap-sm bg-[#FFFFFF] rounded-2xl p-lg shadow-md">
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
          <Text className="font-lexend text-sm text-[#AB94FF]">10:00 AM</Text>
        </View>
        <View className={`flex items-center justify-center ${status === "todo" ? "bg-[#E3F2FF]" : status === "in_progress" ? "bg-[#FFE9E1]" : "bg-[#EDE8FF]"} rounded-full py-[1px] px-[6px]`}>
          <Text className={`font-lexend text-sm ${status === "todo" ? "text-[#0087FF]" : status === "in_progress" ? "text-[#FF7D53]" : "text-primary"}`}>{status_text}</Text>
        </View>
      </View>
    </View>
  );
}
