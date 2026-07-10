import { Stack } from "expo-router";
import { ImageBackground } from "react-native";

export default function BaseLayout() {
  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      className="flex-1 px-xl"
      resizeMode="cover"
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
      >
        <Stack.Screen name="Home" />
      </Stack>
    </ImageBackground>
  );
}
