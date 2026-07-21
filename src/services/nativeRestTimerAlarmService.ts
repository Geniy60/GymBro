import { Platform } from 'react-native';
import { requireNativeModule } from 'expo-modules-core';

type NativeRestTimerAlarmModule = {
  cancelRestTimerAlarmAsync: () => Promise<void>;
  canScheduleRestTimerAlarmAsync: () => Promise<boolean>;
  openRestTimerAlarmSettingsAsync: () => Promise<void>;
  scheduleRestTimerAlarmAsync: (
    seconds: number,
    title: string,
    body: string,
    channelName: string,
  ) => Promise<boolean>;
};

export type NativeRestTimerAlarmScheduleResult =
  | 'permissionDenied'
  | 'scheduled'
  | 'unavailable';

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
}): Promise<NativeRestTimerAlarmScheduleResult> {
  const RestTimerAlarmModule = getNativeRestTimerAlarmModule();

  if (RestTimerAlarmModule === null) {
    return 'unavailable';
  }

  const didSchedule = await RestTimerAlarmModule.scheduleRestTimerAlarmAsync(
    seconds,
    title,
    body,
    channelName,
  );

  return didSchedule ? 'scheduled' : 'permissionDenied';
}

export async function cancelNativeRestTimerAlarm(): Promise<void> {
  const RestTimerAlarmModule = getNativeRestTimerAlarmModule();

  if (RestTimerAlarmModule === null) {
    return;
  }

  await RestTimerAlarmModule.cancelRestTimerAlarmAsync();
}

export async function openNativeRestTimerAlarmSettings(): Promise<void> {
  const RestTimerAlarmModule = getNativeRestTimerAlarmModule();

  if (RestTimerAlarmModule === null) {
    return;
  }

  await RestTimerAlarmModule.openRestTimerAlarmSettingsAsync();
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
