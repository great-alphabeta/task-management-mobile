import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import { Host, LinearProgressIndicator } from '@expo/ui/jetpack-compose';
import { fillMaxWidth, height } from '@expo/ui/jetpack-compose/modifiers';
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
  const backgroundColor = type === "office_project" ? "#E7F3FF" : type === "personal_project" ? "#FFE9E1" : "#E7F3FF";
  return (
    <View className="flex flex-col bg-[#E7F3FF] rounded-lg p-lg w-[200px] gap-lg">
      <View className="flex flex-row items-center justify-between">
        <Text className='text-secondary text-sm font-lexend'>{type_name}</Text>
        <View className='w-[24px] h-[24px] bg-[#FFE4F2] rounded-md items-center justify-center'>
          <BriefcaseIcon color="#F478B8" width={14} height={14} />
        </View>
      </View>
      <Text className='text-black font-lexend'>{name}</Text>
      <View className="w-full">
        <Host style={{ width: "100%", height: PROGRESS_HEIGHT }}>
          <LinearProgressIndicator
            progress={completed}
            color="#0087FF"
            trackColor="white"
            gapSize={0}
            strokeCap="round"
            drawStopIndicator={{ stopSize: 0 }}
            modifiers={[fillMaxWidth(), height(PROGRESS_HEIGHT)]}
          />
        </Host>
      </View>
    </View>
  );
}
