import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Workout } from '../types';

const workoutsStorageKey = 'gymbro.workouts.v2';
const legacyWorkoutsStorageKey = 'gymbro.workouts.v1';

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

    if (storedValue !== null) {
      return parseStoredWorkouts(storedValue);
    }

    const legacyStoredValue = await AsyncStorage.getItem(legacyWorkoutsStorageKey);

    if (legacyStoredValue === null) {
      return {
        ok: true,
        workouts: [],
      };
    }

    const migratedWorkouts = parseLegacyWorkouts(legacyStoredValue);
    await AsyncStorage.setItem(workoutsStorageKey, JSON.stringify(migratedWorkouts));

    return {
      ok: true,
      workouts: migratedWorkouts,
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

function parseStoredWorkouts(storedValue: string): LoadWorkoutsResult {
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
}

function parseLegacyWorkouts(storedValue: string): Workout[] {
  const parsedValue: unknown = JSON.parse(storedValue);

  if (!Array.isArray(parsedValue)) {
    return [];
  }

  return parsedValue
    .filter(isLegacyWorkout)
    .map((legacyWorkout) => ({
      id: legacyWorkout.id,
      name: legacyWorkout.name,
      startedAt: new Date().toISOString(),
      exercises: [],
    }));
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
    typeof workout.startedAt === 'string' &&
    Array.isArray(workout.exercises) &&
    workout.exercises.every(isWorkoutExercise)
  );
}

function isWorkoutExercise(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const exercise = value as Record<string, unknown>;

  return (
    typeof exercise.id === 'string' &&
    typeof exercise.machineId === 'string' &&
    typeof exercise.machineName === 'string' &&
    Array.isArray(exercise.sets) &&
    exercise.sets.every(isWorkoutSet)
  );
}

function isWorkoutSet(value: unknown) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const workoutSet = value as Record<string, unknown>;

  return (
    typeof workoutSet.id === 'string' &&
    typeof workoutSet.weightKg === 'string' &&
    typeof workoutSet.reps === 'string' &&
    typeof workoutSet.note === 'string'
  );
}

function isLegacyWorkout(value: unknown): value is { id: string; name: string } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const workout = value as Record<string, unknown>;

  return typeof workout.id === 'string' && typeof workout.name === 'string';
}
