import { Platform } from 'react-native';

import { strings } from '../strings';

const REST_TIMER_CHANNEL_ID = 'gymbro-rest-timer';

type ExpoNotifications = typeof import('expo-notifications');

let notificationsModule: ExpoNotifications | null = null;
let hasConfiguredNotificationHandler = false;

export async function scheduleRestTimerNotification(
  seconds: number,
): Promise<string | null> {
  const Notifications = await loadNotificationsModule();
  const hasPermission = await ensureNotificationPermission(Notifications);

  if (!hasPermission) {
    return null;
  }

  await ensureRestTimerChannel(Notifications);

  return Notifications.scheduleNotificationAsync({
    content: {
      body: strings.restTimer.notificationBody,
      sound: true,
      title: strings.restTimer.notificationTitle,
    },
    trigger: {
      channelId: REST_TIMER_CHANNEL_ID,
      repeats: false,
      seconds,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });
}

export async function cancelRestTimerNotification(
  notificationId: string | null,
): Promise<void> {
  if (notificationId === null) {
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
    importance: Notifications.AndroidImportance.HIGH,
    name: strings.restTimer.notificationChannelName,
    sound: 'default',
  });
}
