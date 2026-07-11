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
  return (
    <View className="flex flex-col gap-sm bg-[#FFFFFF] rounded-lg p-lg">
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
        <View className="flex items-center justify-center bg-[#F5F5F5] rounded-full py-[1px] px-[6px]">
          <Text className="font-lexend text-sm">{status}</Text>
        </View>
      </View>
    </View>
  );
}
