import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

function ButtonBackground({
  width,
  height,
  backgroundColor,
  rightIcon = null,
}: {
  width: number | string;
  height: number | string;
  backgroundColor: string;
  rightIcon?: React.ReactNode | null;
}) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 331 52"
      preserveAspectRatio="none"
      fill="none"
    >
      <Path
        d="M0 15.724C0 8.10067 6.07038 1.88084 13.6925 1.74209C43.5022 1.19944 115.638 -0.00982954 166 6.10352e-05C215.917 0.00986421 287.606 1.20648 317.308 1.74385C324.931 1.88176 331 8.10198 331 15.7262V36.2738C331 43.898 324.931 50.1183 317.308 50.2562C287.606 50.7936 215.917 51.9902 166 52C115.638 52.0099 43.5022 50.8006 13.6925 50.2579C6.07037 50.1192 0 43.8994 0 36.276V15.724Z"
        fill={backgroundColor}
      />
    </Svg>
  );
}

export default function RoundedButton({
  text,
  isFullWidth = true,
  primary = true,
  rightIcon = null,
  className = "",
  size = "md",
  onPress,
  disabled = false,
}: {
  text: string;
  isFullWidth?: boolean;
  primary?: boolean;
  rightIcon?: React.ReactNode | null;
  className?: string;
  size?: "sm" | "md" | "lg";
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        height: size === "sm" ? 38 : size === "md" ? 52 : 64,
        width: isFullWidth ? "100%" : undefined,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <View
        style={{
          position: "absolute",
          inset: 0,
        }}
      >
        <ButtonBackground width="100%" height="100%" backgroundColor={primary ? "#5F27FF" : "#EDE8FF"} />
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        className={className}
      >
        <Text className={`${primary ? "text-[#FFFFFF]" : "text-primary"} font-lexend-semibold ${size === "sm" ? "text-base" : size === "md" ? "text-lg" : "text-xl"}`}>{text}</Text>
        {rightIcon && <View className="absolute right-[22px]">{rightIcon}</View>}
      </View>
    </Pressable>
  );
}
