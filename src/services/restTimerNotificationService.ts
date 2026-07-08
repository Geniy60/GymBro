import { Platform } from 'react-native';

import { strings } from '../strings';
import {
  cancelNativeRestTimerAlarm,
  scheduleNativeRestTimerAlarm,
} from './nativeRestTimerAlarmService';

const REST_TIMER_CHANNEL_ID = 'gymbro-rest-timer-v2';
const NATIVE_REST_TIMER_ALARM_ID = 'native-rest-timer-alarm';
const REST_TIMER_VIBRATION_PATTERN = [0, 300, 200, 300];

type ExpoNotifications = typeof import('expo-notifications');

let notificationsModule: ExpoNotifications | null = null;
let hasConfiguredNotificationHandler = false;

export async function scheduleRestTimerNotification(
  seconds: number,
): Promise<string | null> {
  const Notifications = await loadNotificationsModule();

  await ensureRestTimerChannel(Notifications);

  const hasPermission = await ensureNotificationPermission(Notifications);

  if (!hasPermission) {
    return null;
  }

  if (Platform.OS === 'android') {
    const didScheduleNativeAlarm = await scheduleNativeRestTimerAlarm({
      body: strings.restTimer.notificationBody,
      channelName: strings.restTimer.notificationChannelName,
      seconds,
      title: strings.restTimer.notificationTitle,
    });

    if (didScheduleNativeAlarm) {
      return NATIVE_REST_TIMER_ALARM_ID;
    }
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      body: strings.restTimer.notificationBody,
      priority: Notifications.AndroidNotificationPriority.MAX,
      sound: true,
      title: strings.restTimer.notificationTitle,
      vibrate: REST_TIMER_VIBRATION_PATTERN,
    },
    trigger: {
      channelId: REST_TIMER_CHANNEL_ID,
      date: new Date(Date.now() + seconds * 1000),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
}

export async function cancelRestTimerNotification(
  notificationId: string | null,
): Promise<void> {
  if (notificationId === null) {
    return;
  }

  if (notificationId === NATIVE_REST_TIMER_ALARM_ID) {
    await cancelNativeRestTimerAlarm();
    return;
  }

  const Notifications = await loadNotificationsModule();

  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

async function loadNotificationsModule(): Promise<ExpoNotifications> {
  if (notificationsModule === null) {
    notificationsModule = await import('expo-notifications');
  }

  if (!hasConfiguredNotificationHandler) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    hasConfiguredNotificationHandler = true;
  }

  return notificationsModule;
}

async function ensureNotificationPermission(
  Notifications: ExpoNotifications,
): Promise<boolean> {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (
    currentPermission.granted ||
    currentPermission.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();

  return (
    requestedPermission.granted ||
    requestedPermission.ios?.status ===
      Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

async function ensureRestTimerChannel(
  Notifications: ExpoNotifications,
): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(REST_TIMER_CHANNEL_ID, {
    enableVibrate: true,
    importance: Notifications.AndroidImportance.MAX,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    name: strings.restTimer.notificationChannelName,
    sound: 'default',
    vibrationPattern: REST_TIMER_VIBRATION_PATTERN,
  });
}
