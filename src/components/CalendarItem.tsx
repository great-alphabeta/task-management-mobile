import { isSameDay } from "@/utils/date";
import { Pressable, Text, View } from "react-native";

export default function CalendarItem({
  date = new Date(),
  selected = false,
  onPress,
}: {
  date: Date;
  selected?: boolean;
  onPress?: () => void;
}) {
  const month = date.toLocaleString("default", { month: "short" });
  const day = date.getDate();
  const dayOfWeek = date.toLocaleString("default", { weekday: "short" });
  const active = selected;
  const isToday = isSameDay(date, new Date());

  return (
    <Pressable onPress={onPress} className="self-start">
      <View className={`py-sm px-lg flex-col items-center rounded-lg gap-xs ${active ? "bg-primary" : isToday ? "bg-[#EDE8FF]": "bg-white"} shadow-md shadow-black/10`}>
        <Text className={`font-lexend text-sm ${active ? "text-white" : "text-black"}`}>{month}</Text>
        <Text className={`font-lexend-semibold text-lg ${active ? "text-white" : "text-black"}`}>{day}</Text>
        <Text className={`font-lexend text-sm ${active ? "text-white" : "text-black"}`}>{dayOfWeek}</Text>
      </View>
    </Pressable>
  );
}
