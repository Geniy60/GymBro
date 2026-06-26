import { Alert } from 'react-native';

export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export type AppAlertButton = {
  onPress?: () => void;
  style?: AppAlertButtonStyle;
  text: string;
};

export type AppAlertConfig = {
  buttons?: AppAlertButton[];
  message?: string;
  title: string;
};

type AppAlertListener = (config: AppAlertConfig) => void;

let listener: AppAlertListener | null = null;

export function showAppAlert(
  title: string,
  message?: string,
  buttons?: AppAlertButton[],
) {
  const config: AppAlertConfig = { title, message, buttons };

  if (listener) {
    listener(config);
    return;
  }

  if (buttons) {
    Alert.alert(title, message, buttons);
    return;
  }

  Alert.alert(title, message);
}

export function subscribeToAppAlerts(nextListener: AppAlertListener) {
  listener = nextListener;

  return () => {
    if (listener === nextListener) {
      listener = null;
    }
  };
}
