import ShadowImage from "@/assets/images/shadow.png";
import RightIcon from "@/assets/svg/right.svg";
import RoundedButton from "@/components/RoundedButton";
import { setupDatabase } from "@/db";
import { showAlert } from "@/utils/alert";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Text, View } from "react-native";

export default function OnBoarding() {
  const [isSettingUp, setIsSettingUp] = useState(false);

  const handleStart = async () => {
    setIsSettingUp(true);

    try {
      await setupDatabase();
      router.replace("/(base)/Home");
    } catch (error) {
      console.error(error);
      showAlert("Setup failed", "Could not create the database. Please try again.");
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <View className="flex flex-col h-full">
      <Image source={require("@/assets/images/onboarding.png")} className="w-full h-full absolute" />
      <View className="flex flex-1"></View>
      <View className="flex flex-col p-xl justify-center items-center bottom-[75px]">
        <Text className="text-xl font-lexend-semibold px-xl text-center mb-lg">Task Management &{"\n"} To-Do List</Text>
        <Text className="font-lexend px-xl text-center text-secondary mb-xl">This productive tool is designed to help{"\n"}you better manage your task{"\n"}project-wise conveniently!</Text>
        <View className="flex flex-col items-center w-full">
          <RoundedButton
            text={isSettingUp ? "Setting up..." : "Let's Start"}
            rightIcon={<RightIcon color="white" />}
            onPress={handleStart}
            disabled={isSettingUp}
          />
          <Image source={ShadowImage} className="absolute w-full h-[40px] bottom-[-20px]" resizeMode="stretch" />
        </View>
      </View>
    </View>
  );
}
