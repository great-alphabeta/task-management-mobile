import BookIcon from "@/assets/svg/book.svg";
import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import UserIcon from "@/assets/svg/user.svg";
import LinearProgressBar from "@/components/progress/LinearProgressBar";
import { Text, View } from "react-native";

const PROGRESS_HEIGHT = 6;

export default function ProjectItem({
  name = "Project 1",
  type = "office_project",
  completed = 0,
}: {
  name: string;
  type: "office_project" | "personal_project" | "daily_study";
  completed?: number;
}) {
  const type_name = type === "office_project" ? "Office Project" : type === "personal_project" ? "Personal Project" : "Daily Study";
  const color = type === "office_project" ? "#0087FF" : type === "personal_project" ? "#FF7D53" : "#F478B8";
  const iconColor = type === "office_project" ? "#F478B8" : type === "personal_project" ? "#9260F4" : "#FF9142";
  const icon = type === "office_project" ? <BriefcaseIcon color={iconColor} width={14} height={14} /> : type === "personal_project" ? <UserIcon color={iconColor} width={14} height={14} /> : <BookIcon color={iconColor} width={14} height={14} />;
  const backgroundColor = type === "office_project" ? "#E7F3FF" : type === "personal_project" ? "#FFE9E1" : "#EDE4FF";
  const iconBackground = type === "office_project" ? "#FFE4F2" : type === "personal_project" ? "#EDE4FF" : "#FFE6D4";
  return (
    <View className="flex flex-col rounded-xl p-lg w-[200px] gap-lg" style={{ backgroundColor: backgroundColor }}>
      <View className="flex flex-row items-center justify-between">
        <Text className='text-secondary text-sm font-lexend'>{type_name}</Text>
        <View className='w-[24px] h-[24px] rounded-md items-center justify-center shadow-md shadow-black/10' style={{ backgroundColor: iconBackground }}>
          {icon}
        </View>
      </View>
      <Text className='text-black font-lexend'>{name}</Text>
      <View className="w-full">
        <LinearProgressBar
          progress={completed}
          color={color}
          trackColor="white"
          height={PROGRESS_HEIGHT}
        />
      </View>
    </View>
  );
}
