import CalendarItem from "@/components/CalendarItem";
import Header from "@/components/Header";
import RoundedButton from "@/components/RoundedButton";
import { useState } from "react";
import { View } from "react-native";

export default function TodayTask() {
  const [activeFilter, setActiveFilter] = useState<"All" | "To do" | "In Progress" | "Done">("All");

  return (
    <View className="flex flex-col">
      <Header title="Today's Task" />
      <View className="w-full flex flex-col gap-md">
        <View className="flex flex-row gap-sm justify-between">
          {
            Array.from({ length: 5 }, (_, index) => {
              const date = new Date();
              date.setDate(date.getDate() + index - 2);
              return date;
            }).map((date) => (
              <CalendarItem key={date.toISOString()} date={date} />
            ))
          }
        </View>
        <View className="flex flex-row gap-sm">
          {
            ["All", "To do", "In Progress", "Done"].map((text) => (
              <RoundedButton
                text={text}
                isFullWidth={false}
                size="sm"
                className="px-xl py-sm"
                primary={text === activeFilter}
                onPress={() => setActiveFilter(text as "All" | "To do" | "In Progress" | "Done")}
              />
            ))
          }
        </View>
      </View>
    </View>
  );
} 
