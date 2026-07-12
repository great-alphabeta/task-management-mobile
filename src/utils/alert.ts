export type AlertButtonStyle = "default" | "cancel" | "destructive";

export type AlertButton = {
  text: string;
  style?: AlertButtonStyle;
  onPress?: () => void;
};

export type AlertPayload = {
  title: string;
  message: string;
  buttons: AlertButton[];
};

type AlertListener = (payload: AlertPayload) => void;

let listener: AlertListener | null = null;

export function registerAlertListener(nextListener: AlertListener) {
  listener = nextListener;
}

export function unregisterAlertListener() {
  listener = null;
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
) {
  listener?.({
    title,
    message: message ?? "",
    buttons: buttons?.length
      ? buttons
      : [{ text: "OK", style: "default" }],
  });
}
