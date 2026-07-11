import { createId } from './createId';
import { strings } from './strings';
import { colors } from './theme/colors';
import type { Workout } from './types';

export function createNewWorkout(userId: string): Workout {
  return {
    id: createId(),
    userId,
    name: createDefaultWorkoutName(),
    startedAt: new Date().toISOString(),
    exercises: [],
  };
}

export function createRepeatedWorkout({
  sourceWorkout,
  userId,
}: {
  sourceWorkout: Workout;
  userId: string;
}): Workout {
  return {
    id: createId(),
    userId,
    name: createDefaultWorkoutName(),
    startedAt: new Date().toISOString(),
    exercises: sourceWorkout.exercises.map((exercise) => ({
      ...exercise,
      id: createId(),
      sets: exercise.sets.map((workoutSet) => ({
        ...workoutSet,
        id: createId(),
      })),
    })),
  };
}

export function getAppBackgroundColor(): string {
  return colors.appBackground;
}

function createDefaultWorkoutName() {
  const today = new Date();
  const weekday = today.toLocaleDateString('ru-RU', { weekday: 'long' });
  const formattedWeekday =
    weekday.charAt(0).toLocaleUpperCase('ru-RU') + weekday.slice(1);

  return strings.workouts.defaultNameWithDate(
    formattedWeekday,
    today.toLocaleDateString('ru-RU'),
  );
}
