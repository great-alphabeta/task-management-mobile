import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

import type { FormDateTimePickerProps } from "./FormDateTimePicker.types";

export default function FormDateTimePicker({
  visible,
  value,
  mode,
  onConfirm,
  onClose,
  testID,
}: FormDateTimePickerProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [visible, value]);

  if (!visible) {
    return null;
  }

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable onPress={(event) => event.stopPropagation()}>
          <View className="bg-white rounded-t-2xl px-xl pt-lg pb-xl gap-lg">
            <DateTimePicker
              testID={testID}
              value={draft}
              mode={mode}
              display="spinner"
              onChange={(_event, date) => {
                if (date) {
                  setDraft(date);
                }
              }}
              style={{ height: mode === "date" ? 216 : 180 }}
            />
            <Pressable
              className="bg-primary rounded-lg py-md items-center"
              onPress={() => {
                onConfirm(draft);
                onClose();
              }}
            >
              <Text className="text-white font-lexend-semibold">Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
