import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import type { FormDateTimePickerProps } from "./FormDateTimePicker.types";

export default function FormDateTimePicker({
  visible,
  value,
  mode,
  onConfirm,
  onClose,
  testID,
}: FormDateTimePickerProps) {
  if (!visible) {
    return null;
  }

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      onClose();
      return;
    }

    if (date) {
      onConfirm(date);
    }

    onClose();
  };

  return (
    <DateTimePicker
      testID={testID}
      value={value}
      mode={mode}
      onChange={handleChange}
    />
  );
}
