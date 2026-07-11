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

  return (
    <Pressable onPress={onPress}>
      <View className={`py-sm px-xl flex-col items-center rounded-lg justify-between gap-sm ${active ? "bg-primary" : "bg-white"} shadow-md shadow-black/10`}>
        <Text className={`font-lexend text-sm ${active ? "text-white" : "text-black"}`}>{month}</Text>
        <Text className={`font-lexend-semibold text-lg ${active ? "text-white" : "text-black"}`}>{day}</Text>
        <Text className={`font-lexend text-sm ${active ? "text-white" : "text-black"}`}>{dayOfWeek}</Text>
      </View>
    </Pressable>
  );
}
