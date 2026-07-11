import { ImageBackground, View } from "react-native";

export default function ScreenBackground({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex flex-1 px-xl">{children}</View>
    </ImageBackground>
  );
}
