import LeftArrowIcon from "@/assets/svg/left.svg";
import NotificationIcon from "@/assets/svg/notification.svg";
import { Text, View } from "react-native";

export default function Header({
  title = "",
}: {
  title: string;
}) {
  return (
    <View className="flex flex-row p-lg w-full gap-lg items-center justify-center">
      <View>
        <LeftArrowIcon />
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-black font-lexend-semibold text-lg">{title}</Text>
      </View>
      <View>
        <NotificationIcon />
        <View className="w-[8px] h-[8px] rounded-full bg-primary absolute top-0 right-[3px]" />
      </View>
    </View>
  );
}
