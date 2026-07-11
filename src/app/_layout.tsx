import "../../global.css";

import { LexendDeca_400Regular, LexendDeca_600SemiBold, LexendDeca_700Bold, useFonts } from '@expo-google-fonts/lexend-deca';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    LexendDeca_400Regular,
    LexendDeca_600SemiBold,
    LexendDeca_700Bold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;
    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView className="flex-1">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(base)" />
        <Stack.Screen name="OnBoarding" />
      </Stack>
    </SafeAreaView>
  );
}
