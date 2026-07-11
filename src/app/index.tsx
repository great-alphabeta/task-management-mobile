import { isDatabaseInitialized } from "@/db";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function prepare() {
      const initialized = await isDatabaseInitialized();
      setIsInitialized(initialized);
      setIsReady(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  if (isInitialized) {
    return <Redirect href="/(base)/Home" />;
  }

  return <Redirect href="/OnBoarding" />;
}
