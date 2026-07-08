import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

type NativeRestTimerAlarmModule = {
  cancelRestTimerAlarmAsync: () => Promise<void>;
  scheduleRestTimerAlarmAsync: (
    seconds: number,
    title: string,
    body: string,
    channelName: string,
  ) => Promise<boolean>;
};

let nativeModule: NativeRestTimerAlarmModule | null | undefined;

export async function scheduleNativeRestTimerAlarm({
  body,
  channelName,
  seconds,
  title,
}: {
  body: string;
  channelName: string;
  seconds: number;
  title: string;
}): Promise<boolean> {
  const RestTimerAlarmModule = getNativeRestTimerAlarmModule();

  if (RestTimerAlarmModule === null) {
    return false;
  }

  return RestTimerAlarmModule.scheduleRestTimerAlarmAsync(
    seconds,
    title,
    body,
    channelName,
  );
}

export async function cancelNativeRestTimerAlarm(): Promise<void> {
  const RestTimerAlarmModule = getNativeRestTimerAlarmModule();

  if (RestTimerAlarmModule === null) {
    return;
  }

  await RestTimerAlarmModule.cancelRestTimerAlarmAsync();
}

function getNativeRestTimerAlarmModule(): NativeRestTimerAlarmModule | null {
  if (Platform.OS !== 'android') {
    return null;
  }

  if (nativeModule !== undefined) {
    return nativeModule;
  }

  try {
    nativeModule = requireNativeModule<NativeRestTimerAlarmModule>(
      'GymbroRestTimerAlarm',
    );
  } catch {
    nativeModule = null;
  }

  return nativeModule;
}
