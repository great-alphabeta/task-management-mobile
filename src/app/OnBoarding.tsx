import ShadowImage from "@/assets/images/shadow.png";
import RightIcon from "@/assets/svg/right.svg";
import RoundedButton from "@/components/RoundedButton";
import { Image, Text, View } from "react-native";

export default function OnBoarding() {
  return (
    <View className="flex flex-col h-full">
      <Image source={require("@/assets/images/onboarding.png")} className="w-full h-full absolute" />
      <View className="flex flex-1"></View>
      <View className="flex flex-col p-xl justify-center items-center bottom-[75px]">
        <Text className="text-xl font-lexend-semibold px-xl text-center mb-lg">Task Management &{"\n"} To-Do List</Text>
        <Text className="font-lexend px-xl text-center text-secondary mb-xl">This productive tool is designed to help{"\n"}you better manage your task{"\n"}project-wise conveniently!</Text>
        <View className="flex flex-col items-center w-full">
          <RoundedButton text="Let's Start" rightIcon={<RightIcon color="white" />} />
          <Image source={ShadowImage} className="absolute w-full h-[40px] bottom-[-20px]" resizeMode="stretch" />
        </View>
      </View>
    </View>
  );
}
