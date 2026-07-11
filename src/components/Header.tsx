import LeftArrowIcon from "@/assets/svg/left.svg";
import NotificationIcon from "@/assets/svg/notification.svg";
import { router, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Header({
  title = "",
  showBack = true,
  fallbackHref = "/(base)/Home" as Href,
}: {
  title: string;
  showBack?: boolean;
  fallbackHref?: Href;
}) {
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(fallbackHref);
  };

  return (
    <View className="flex flex-row p-lg w-full gap-lg items-center justify-center">
      <View>
        {showBack ? (
          <Pressable onPress={handleBack}>
            <LeftArrowIcon />
          </Pressable>
        ) : (
          <View className="w-[24px]" />
        )}
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
