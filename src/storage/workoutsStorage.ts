import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '../types';

const workoutsStorageKey = 'gymbro.workouts.v1';

type LoadWorkoutsResult =
  | {
      ok: true;
      workouts: Workout[];
    }
  | {
      ok: false;
    };

type SaveWorkoutsResult = {
  ok: boolean;
};

export async function loadWorkouts(): Promise<LoadWorkoutsResult> {
  try {
    const storedValue = await AsyncStorage.getItem(workoutsStorageKey);

    if (storedValue === null) {
      return {
        ok: true,
        workouts: [],
      };
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isWorkoutList(parsedValue)) {
      return {
        ok: true,
        workouts: [],
      };
    }

    return {
      ok: true,
      workouts: parsedValue,
    };
  } catch {
    return {
      ok: false,
    };
  }
}

export async function saveWorkouts(workouts: Workout[]): Promise<SaveWorkoutsResult> {
  try {
    await AsyncStorage.setItem(workoutsStorageKey, JSON.stringify(workouts));

    return {
      ok: true,
    };
  } catch {
    return {
      ok: false,
    };
  }
}

function isWorkoutList(value: unknown): value is Workout[] {
  return Array.isArray(value) && value.every(isWorkout);
}

function isWorkout(value: unknown): value is Workout {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const workout = value as Record<string, unknown>;

  return (
    typeof workout.id === 'string' &&
    typeof workout.name === 'string' &&
    typeof workout.note === 'string'
  );
}
