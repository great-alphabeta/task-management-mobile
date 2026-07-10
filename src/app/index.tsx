import RoundedButton from "@/components/RoundedButton";
import { View } from "react-native";

export default function Index() {
  return (
    <View className="flex flex-row gap-sm">
      <RoundedButton primary={false} text="Button">
      </RoundedButton>
    </View>
  );
}
