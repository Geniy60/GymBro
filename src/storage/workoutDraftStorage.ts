import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '../types';

const workoutDraftStorageKey = 'gymbro.activeWorkoutDraft.v1';

export type StoredWorkoutDraft = {
  isNewWorkout: boolean;
  savedAt: string;
  userId: string;
  workout: Workout;
};

export async function loadWorkoutDraft(): Promise<StoredWorkoutDraft | null> {
  const rawDraft = await AsyncStorage.getItem(workoutDraftStorageKey);

  if (rawDraft === null) {
    return null;
  }

  try {
    const parsedDraft = JSON.parse(rawDraft) as Partial<StoredWorkoutDraft>;

    if (
      typeof parsedDraft.userId !== 'string' ||
      typeof parsedDraft.savedAt !== 'string' ||
      typeof parsedDraft.isNewWorkout !== 'boolean' ||
      !isWorkout(parsedDraft.workout)
    ) {
      return null;
    }

    return {
      isNewWorkout: parsedDraft.isNewWorkout,
      savedAt: parsedDraft.savedAt,
      userId: parsedDraft.userId,
      workout: parsedDraft.workout,
    };
  } catch {
    return null;
  }
}

export async function saveWorkoutDraft(draft: StoredWorkoutDraft): Promise<void> {
  await AsyncStorage.setItem(workoutDraftStorageKey, JSON.stringify(draft));
}

export async function clearWorkoutDraft(workoutId?: string): Promise<void> {
  if (workoutId === undefined) {
    await AsyncStorage.removeItem(workoutDraftStorageKey);
    return;
  }

  const draft = await loadWorkoutDraft();

  if (draft?.workout.id === workoutId) {
    await AsyncStorage.removeItem(workoutDraftStorageKey);
  }
}

function isWorkout(value: unknown): value is Workout {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const workout = value as Partial<Workout>;

  return (
    typeof workout.id === 'string' &&
    typeof workout.userId === 'string' &&
    typeof workout.name === 'string' &&
    typeof workout.startedAt === 'string' &&
    Array.isArray(workout.exercises)
  );
}
