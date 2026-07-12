import {
  registerAlertListener,
  unregisterAlertListener,
  type AlertButton,
  type AlertPayload,
} from "@/utils/alert";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

function AlertActionButton({
  button,
  onPress,
  fullWidth,
}: {
  button: AlertButton;
  onPress: () => void;
  fullWidth?: boolean;
}) {
  const isCancel = button.style === "cancel";
  const isDestructive = button.style === "destructive";

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-lg py-md px-lg items-center justify-center ${fullWidth ? "w-full" : "flex-1"} ${
        isCancel
          ? "bg-[#EDE8FF]"
          : isDestructive
            ? "bg-[#FFE9E9]"
            : "bg-primary"
      }`}
    >
      <Text
        className={`font-lexend-semibold text-base ${
          isCancel
            ? "text-primary"
            : isDestructive
              ? "text-[#FF4D4F]"
              : "text-white"
        }`}
      >
        {button.text}
      </Text>
    </Pressable>
  );
}

export default function AppAlertProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [alert, setAlert] = useState<AlertPayload | null>(null);

  useEffect(() => {
    registerAlertListener((payload) => {
      setAlert(payload);
    });

    return unregisterAlertListener;
  }, []);

  const dismiss = () => {
    setAlert(null);
  };

  const handlePress = (button: AlertButton) => {
    dismiss();
    button.onPress?.();
  };

  const canDismissOnBackdrop = alert?.buttons.length === 1
    && alert.buttons[0].style !== "destructive";

  return (
    <>
      {children}
      <Modal
        visible={alert !== null}
        transparent
        animationType="fade"
        onRequestClose={dismiss}
      >
        <Pressable
          className="flex-1 bg-black/40 justify-center px-xl"
          onPress={canDismissOnBackdrop ? dismiss : undefined}
        >
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View className="bg-white rounded-xl p-xl gap-lg shadow-md shadow-black/10">
              <View className="gap-sm">
                <Text className="font-lexend-semibold text-lg text-black">
                  {alert?.title}
                </Text>
                {alert?.message ? (
                  <Text className="font-lexend text-base text-secondary">
                    {alert.message}
                  </Text>
                ) : null}
              </View>

              {alert?.buttons.length === 1 ? (
                <AlertActionButton
                  button={alert.buttons[0]}
                  onPress={() => handlePress(alert.buttons[0])}
                  fullWidth
                />
              ) : (
                <View className="flex-row gap-sm">
                  {alert?.buttons.map((button, index) => (
                    <AlertActionButton
                      key={`${button.text}-${index}`}
                      button={button}
                      onPress={() => handlePress(button)}
                    />
                  ))}
                </View>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
