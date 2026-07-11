import BriefcaseIcon from "@/assets/svg/briefcase.svg";
import { CircularProgressIndicator, Host } from "@expo/ui/jetpack-compose";
import { graphicsLayer } from "@expo/ui/jetpack-compose/modifiers";
import { Text, View } from "react-native";

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
  return (
    <View className="flex flex-row items-center justify-between bg-[#FFFFFF] rounded-2xl p-lg gap-md shadow-md shadow-black/10">
      <View className='w-[34px] h-[34px] bg-[#FFE4F2] rounded-md items-center justify-center'>
        <BriefcaseIcon color="#F478B8" width={20} height={20} />
      </View>
      <View className="flex-1">
        <Text className="font-lexend text-black">{type_name}</Text>
        <Text className="font-lexend text-secondary text-sm">{task_count} tasks</Text>
      </View>
      <View>
        <Host matchContents>
          <CircularProgressIndicator
            progress={completed}
            trackColor="#EEE9FF"
            color="#8764FF"
            gapSize={0}
            strokeWidth={4}
            modifiers={[graphicsLayer({ scaleX: -1 })]}
          />
        </Host>
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Text className="font-lexend text-black text-sm">
            {Math.round(completed * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}
