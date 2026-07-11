import Navbar from "@/components/Navbar";
import { Stack, useSegments } from "expo-router";
import { ImageBackground, View } from "react-native";

export default function BaseLayout() {
  const segments = useSegments();
  const currentScreen = segments.at(-1);
  const showNavbar = currentScreen !== "AddProject" && currentScreen !== "AddTask" && currentScreen !== "TaskDetail";

  return (
    <ImageBackground
      source={require("@/assets/images/background.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex flex-1">
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen
            name="AddProject"
            options={{ contentStyle: { backgroundColor: "#FAFAFA" } }}
          />
          <Stack.Screen
            name="AddTask"
            options={{ contentStyle: { backgroundColor: "#FAFAFA" } }}
          />
          <Stack.Screen
            name="Home"
            options={{ contentStyle: { backgroundColor: "#FAFAFA" } }}
          />
          <Stack.Screen
            name="TodayTask"
            options={{ contentStyle: { backgroundColor: "#FAFAFA" } }}
          />
          <Stack.Screen
            name="TaskDetail"
            options={{ contentStyle: { backgroundColor: "#FAFAFA" } }}
          />
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
