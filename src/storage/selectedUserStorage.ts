import AsyncStorage from '@react-native-async-storage/async-storage';

const selectedUserStorageKey = 'gymbro.selectedUserId.v1';

export async function loadSelectedUserId(): Promise<string | null> {
  return AsyncStorage.getItem(selectedUserStorageKey);
}

export async function saveSelectedUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(selectedUserStorageKey, userId);
}
