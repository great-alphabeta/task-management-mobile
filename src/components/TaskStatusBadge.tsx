import type { TaskStatus } from "@/types/database";
import { Text, View } from "react-native";

export function getTaskStatusStyle(status: TaskStatus) {
  switch (status) {
    case "to-do":
      return {
        label: "To-do",
        containerClassName: "bg-[#E3F2FF]",
        textClassName: "text-[#0087FF]",
      };
    case "inprogress":
      return {
        label: "In Progress",
        containerClassName: "bg-[#FFE9E1]",
        textClassName: "text-[#FF7D53]",
      };
    case "done":
      return {
        label: "Done",
        containerClassName: "bg-[#EDE8FF]",
        textClassName: "text-primary",
      };
  }
}

export default function TaskStatusBadge({
  status,
}: {
  status: TaskStatus;
}) {
  const style = getTaskStatusStyle(status);

  return (
    <View className={`flex items-center justify-center ${style.containerClassName} rounded-full py-[1px] px-[6px]`}>
      <Text className={`font-lexend text-sm ${style.textClassName}`}>{style.label}</Text>
    </View>
  );
}
