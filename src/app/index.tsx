import CalendarItem from "@/components/CalendarItem";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex flex-row gap-sm">
      <CalendarItem date={new Date('2026-07-09')}/>
      <CalendarItem date={new Date('2026-07-10')}/>
      <CalendarItem date={new Date('2026-07-11')}/>
      <CalendarItem date={new Date('2026-07-12')}/>
      <CalendarItem date={new Date('2026-07-13')}/>
    </View>
  );
}
