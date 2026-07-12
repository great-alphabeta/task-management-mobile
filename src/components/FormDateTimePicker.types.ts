export type FormDateTimePickerMode = "date" | "time";

export type FormDateTimePickerProps = {
  visible: boolean;
  value: Date;
  mode: FormDateTimePickerMode;
  onConfirm: (date: Date) => void;
  onClose: () => void;
  testID?: string;
};
