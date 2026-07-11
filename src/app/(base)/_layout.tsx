import Navbar from "@/components/Navbar";
import { Stack, useSegments } from "expo-router";
import { ImageBackground, View } from "react-native";

export default function BaseLayout() {
  const segments = useSegments();
  const currentScreen = segments.at(-1);
  const showNavbar = currentScreen !== "AddProject";

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex flex-1 px-xl">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="AddProject" />
          <Stack.Screen name="Home" />
        </Stack>
      </View>
      {showNavbar && (
        <View className="w-full absolute bottom-0">
          <Navbar />
        </View>
      )}
    </ImageBackground>
  );
}
