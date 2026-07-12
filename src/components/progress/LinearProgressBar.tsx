import { View } from "react-native";

type LinearProgressBarProps = {
  progress: number;
  color: string;
  trackColor: string;
  height?: number;
};

export default function LinearProgressBar({
  progress,
  color,
  trackColor,
  height = 6,
}: LinearProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      style={{
        width: "100%",
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${clampedProgress * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
