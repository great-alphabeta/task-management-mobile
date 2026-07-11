import NavBarCurve from "@/assets/images/navbar.png";
import PlusIcon from "@/assets/svg/add.svg";
import CalendarIcon from "@/assets/svg/calendar.svg";
import DocumentIcon from "@/assets/svg/document.svg";
import HomeIcon from "@/assets/svg/home.svg";
import ProfileIcon from "@/assets/svg/profile.svg";
import { router, useSegments } from "expo-router";
import { Image, ImageBackground, Pressable, View } from "react-native";

const NAVBAR_CURVE_HEIGHT = 50;
const navbarCurveSource = Image.resolveAssetSource(NavBarCurve);
const navbarCurveAspectRatio = navbarCurveSource.width / navbarCurveSource.height;

export default function Navbar() {
  const segments = useSegments();
  const currentScreen = segments.at(-1);

  const handlePlusPress = () => {
    if (currentScreen === "TodayTask") {
      router.push("/(base)/AddTask");
      return;
    }

    router.push("/(base)/AddProject");
  };

  const handleHomePress = () => {
    router.replace("/(base)/Home");
  };

  const handleCalendarPress = () => {
    router.replace("/(base)/TodayTask");
  };

  return (
    <View className="relative w-full">
      <View className="flex flex-row w-full" style={{ height: NAVBAR_CURVE_HEIGHT }}>
        <View
          className="flex-1 rounded-tl-2xl bg-[#EEE9FF] flex-row items-center justify-between"
          style={{ height: NAVBAR_CURVE_HEIGHT }}
        >
          <View className="flex-1"></View>
          <Pressable onPress={handleHomePress}>
            <HomeIcon width={24} height={24} color="#5F33E1" />
          </Pressable>
          <View className="flex-1"></View>
          <Pressable onPress={handleCalendarPress}>
            <CalendarIcon width={24} height={24} color="#5F33E1" />
          </Pressable>
          <View className="flex-1"></View>
        </View>
        <ImageBackground
          source={NavBarCurve}
          style={{
            height: NAVBAR_CURVE_HEIGHT,
            aspectRatio: navbarCurveAspectRatio,
          }}
          resizeMode="stretch"
        />
        <View
          className="flex-1 rounded-tr-2xl bg-[#EEE9FF] flex-row items-center justify-between"
          style={{ height: NAVBAR_CURVE_HEIGHT }}
        >
          <View className="flex-1"></View>
          <DocumentIcon width={24} height={24} color="#5F33E1" />
          <View className="flex-1"></View>
          <ProfileIcon width={24} height={24} color="#5F33E1" />
          <View className="flex-1"></View>
        </View>
      </View>
      <Pressable
        onPress={handlePlusPress}
        className="rounded-full bg-primary w-[44px] h-[44px] items-center justify-center absolute -top-1/2 left-1/2 -translate-x-1/2 shadow-lg shadow-primary"
      >
        <PlusIcon width={32} height={32} color="#FFFFFF" />
      </Pressable>
    </View >
  );
}
