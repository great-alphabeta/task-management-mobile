import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import UserIcon from "@/assets/svg/user.svg";
import CircularProgressRing from "@/components/progress/CircularProgressRing";
import { Text, View } from "react-native";

const PROGRESS_SIZE = 44;

export default function TaskGroupItem({
  type = "office_project",
  task_count = 0,
  completed = 0.0,
}: {
  type: "office_project" | "personal_project" | "daily_study";
  task_count: number;
  completed: number;
}) {
  const type_name = type === "office_project" ? "Office Project" : type === "personal_project" ? "Personal Project" : "Daily Study";
  const trackColor = type === "office_project" ? "#FFE4F2" : type === "personal_project" ? "#EDE4FF" : "#FFE6D4";
  const color = type === "office_project" ? "#F478B8" : type === "personal_project" ? "#9260F4" : "#FF9142";
  const backgroundColor = type === "office_project" ? "#FFE4F2" : type === "personal_project" ? "#EDE4FF" : "#FFE6D4";
  const iconColor = type === "office_project" ? "#F478B8" : type === "personal_project" ? "#9260F4" : "#FF9142";
  const icon = type === "office_project" ? <BriefcaseIcon color={iconColor} width={20} height={20} /> : type === "personal_project" ? <UserIcon color={iconColor} width={20} height={20} /> : <BookIcon color={iconColor} width={20} height={20} />;
  return (
    <View className="flex flex-row items-center justify-between bg-[#FFFFFF] rounded-2xl p-lg gap-md shadow-md shadow-black/10">
      <View className={`w-[34px] h-[34px] rounded-lg items-center justify-center`} style={{ backgroundColor: backgroundColor }}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="font-lexend text-black">{type_name}</Text>
        <Text className="font-lexend text-secondary text-sm">{task_count} tasks</Text>
      </View>
      <View style={{ width: PROGRESS_SIZE, height: PROGRESS_SIZE }}>
        <CircularProgressRing
          progress={completed}
          size={PROGRESS_SIZE}
          trackColor={trackColor}
          color={color}
          strokeWidth={4}
        />
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Text className="font-lexend text-black text-sm">
            {Math.round(completed * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}
