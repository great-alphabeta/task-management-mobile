import "../../global.css";

import { LexendDeca_400Regular, LexendDeca_600SemiBold, LexendDeca_700Bold, useFonts } from '@expo-google-fonts/lexend-deca';
import { SplashScreen, Stack } from 'expo-router';
import { useEffect } from 'react';

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

  return <Stack />;
}
