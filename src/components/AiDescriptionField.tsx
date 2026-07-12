import { isAiConfigured } from "@/config/ai";
import {
  generateProjectDescription,
  generateTaskDescription,
  improveDescription,
  summarizeDescription,
} from "@/services/ai";
import { showAlert } from "@/utils/alert";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

type AiDescriptionFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  contextName: string;
  contextType: "project" | "task";
  projectName?: string;
};

function AiChipButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="bg-[#EDE8FF] rounded-lg px-md py-sm"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <Text className="text-primary font-lexend text-sm">{label}</Text>
    </Pressable>
  );
}

export default function AiDescriptionField({
  label,
  value,
  onChangeText,
  contextName,
  contextType,
  projectName,
}: AiDescriptionFieldProps) {
  const [isLoading, setIsLoading] = useState(false);
  const aiEnabled = isAiConfigured();
  const contextLabel = contextType === "project" ? "project" : "task";

  const runAiAction = async (action: () => Promise<string>, successMessage: string) => {
    setIsLoading(true);

    try {
      const result = await action();
      onChangeText(result);
      showAlert("AI updated", successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      showAlert("AI unavailable", message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!contextName.trim()) {
      showAlert(
        "Name required",
        `Enter a ${contextLabel} name before generating a description.`,
      );
      return;
    }

    runAiAction(
      () => contextType === "project"
        ? generateProjectDescription(contextName, value)
        : generateTaskDescription(contextName, projectName, value),
      "Description generated.",
    );
  };

  const handleImprove = () => {
    if (!value.trim()) {
      showAlert("Description required", "Add a description to improve first.");
      return;
    }

    runAiAction(
      () => improveDescription(value, contextLabel),
      "Description improved.",
    );
  };

  const handleSummarize = () => {
    if (!value.trim()) {
      showAlert("Description required", "Add a description to summarize first.");
      return;
    }

    if (value.trim().length < 80) {
      showAlert("Already short", "This description is already concise.");
      return;
    }

    runAiAction(
      () => summarizeDescription(value, contextLabel),
      "Description summarized.",
    );
  };

  return (
    <View className="flex flex-col gap-sm w-full bg-[#FFFFFF] p-xl rounded-lg shadow-md shadow-black/10">
      <View className="flex flex-row items-center justify-between">
        <Text className="text-secondary font-lexend text-sm">{label}</Text>
        {isLoading ? <ActivityIndicator size="small" color="#5F33E1" /> : null}
      </View>
      <TextInput
        cursorColor="#7c3aed"
        value={value}
        onChangeText={onChangeText}
        className="font-lexend text-black text-sm min-h-[96px]"
        multiline
        numberOfLines={4}
        placeholder={aiEnabled
          ? "Write a description, or use AI below to generate one."
          : "Write a description."}
        textAlignVertical="top"
      />
      {aiEnabled ? (
        <View className="flex flex-row flex-wrap gap-sm">
          <AiChipButton label="Generate" onPress={handleGenerate} disabled={isLoading} />
          <AiChipButton label="Improve" onPress={handleImprove} disabled={isLoading} />
          <AiChipButton label="Summarize" onPress={handleSummarize} disabled={isLoading} />
        </View>
      ) : (
        <Text className="text-secondary font-lexend text-xs">
          Add EXPO_PUBLIC_OPENROUTER_API_KEY to .env to enable AI descriptions.
        </Text>
      )}
    </View>
  );
}
