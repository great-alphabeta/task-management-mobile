import { Text, View } from "react-native";

export default function CalendarItem({
  date=new Date(),
}: {
  date: Date;
}) {
  const today = new Date();
  const month = date.toLocaleString('default', { month: 'short' });
  const day = date.getDate();
  const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
  const active = date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();

  return (
    <View className={`py-sm px-lg flex-col items-center rounded-lg justify-between gap-sm ${active ? 'bg-primary' : 'bg-white'}`}>
      <Text className={`font-lexend text-sm ${active ? 'text-white' : 'text-black'}`}>{month}</Text>
      <Text className={`font-lexend-semibold text-lg ${active ? 'text-white' : 'text-black'}`}>{day}</Text>
      <Text className={`font-lexend text-sm ${active ? 'text-white' : 'text-black'}`}>{dayOfWeek}</Text>
    </View>
  );
}
