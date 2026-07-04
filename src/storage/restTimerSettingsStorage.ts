import AsyncStorage from '@react-native-async-storage/async-storage';

const REST_TIMER_SECONDS_KEY = 'gymbro.restTimerSeconds';

export const DEFAULT_REST_TIMER_SECONDS = 90;

export async function loadRestTimerSeconds(): Promise<number> {
  const storedValue = await AsyncStorage.getItem(REST_TIMER_SECONDS_KEY);

  if (storedValue === null) {
    return DEFAULT_REST_TIMER_SECONDS;
  }

  const parsedValue = Number(storedValue);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : DEFAULT_REST_TIMER_SECONDS;
}

export async function saveRestTimerSeconds(seconds: number): Promise<void> {
  await AsyncStorage.setItem(REST_TIMER_SECONDS_KEY, String(seconds));
}
