import { createId } from '../../createId';
import { strings } from '../../strings';
import type { Machine, MuscleGroup, Workout, WorkoutExercise, WorkoutSet } from '../../types';

export function filterMachines(machines: Machine[], searchText: string): Machine[] {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();

  if (normalizedSearchText.length === 0) {
    return machines;
  }

  return machines.filter((machine) => {
    const searchableText = [
      machine.name,
      ...machine.muscleGroups.map(
        (muscleGroup) => strings.muscleGroups.labels[muscleGroup],
      ),
      machine.note,
    ].join(' ').toLocaleLowerCase();

    return searchableText.includes(normalizedSearchText);
  });
}

export function pickSuggestedMachines({
  count,
  machines,
  selectedMuscleGroups,
  workout,
}: {
  count: number;
  machines: Machine[];
  selectedMuscleGroups: MuscleGroup[];
  workout: Workout;
}): Machine[] {
  const workoutMachineIds = new Set(
    workout.exercises.map((exercise) => exercise.machineId),
  );
  const candidates = machines.filter(
    (machine) =>
      !workoutMachineIds.has(machine.id) &&
      machine.muscleGroups.some((muscleGroup) =>
        selectedMuscleGroups.includes(muscleGroup),
      ),
  );

  return shuffleMachines(candidates).slice(0, count);
}

export function createSetsFromHistory(
  historySets: WorkoutSet[] | undefined,
): WorkoutSet[] {
  if (historySets === undefined || historySets.length === 0) {
    return createEmptySets(4);
  }

  return historySets.map((historySet) => ({
    ...historySet,
    id: createId(),
  }));
}

export function createEmptySets(count: number): WorkoutSet[] {
  return Array.from({ length: count }, createEmptySet);
}

export function addSetToExercise(exercise: WorkoutExercise): WorkoutExercise {
  const previousSet = exercise.sets[exercise.sets.length - 1];
  const workoutSet: WorkoutSet = {
    ...createEmptySet(),
    weightKg: previousSet?.weightKg ?? '',
    reps: previousSet?.reps ?? '',
  };

  return {
    ...exercise,
    sets: [...exercise.sets, workoutSet],
  };
}

export function normalizeWorkoutForSave(workout: Workout): Workout {
  return {
    ...workout,
    name: workout.name.trim() || strings.workouts.defaultName,
  };
}

export function findWorkoutInputError(workout: Workout): string | null {
  for (const exercise of workout.exercises) {
    for (const workoutSet of exercise.sets) {
      if (!isValidWeightInput(workoutSet.weightKg)) {
        return strings.workouts.invalidWeightMessage;
      }

      if (!isValidRepsInput(workoutSet.reps)) {
        return strings.workouts.invalidRepsMessage;
      }
    }
  }

  return null;
}

export function hasWorkoutChanged(
  initialWorkout: Workout,
  draftWorkout: Workout,
): boolean {
  return (
    JSON.stringify(normalizeWorkoutForSave(initialWorkout)) !==
    JSON.stringify(normalizeWorkoutForSave(draftWorkout))
  );
}

export function shouldConfirmExitWorkout(
  isNewWorkout: boolean,
  initialWorkout: Workout,
  draftWorkout: Workout,
): boolean {
  if (isNewWorkout) {
    return draftWorkout.exercises.length > 0;
  }

  return hasWorkoutChanged(initialWorkout, draftWorkout);
}

function shuffleMachines(machines: Machine[]): Machine[] {
  return machines
    .map((machine) => ({ machine, sortKey: Math.random() }))
    .sort((left, right) => left.sortKey - right.sortKey)
    .map(({ machine }) => machine);
}

function createEmptySet(): WorkoutSet {
  return {
    id: createId(),
    weightKg: '',
    reps: '',
    note: '',
  };
}

function isValidWeightInput(weightKg: string): boolean {
  const normalizedWeightKg = weightKg.trim().replace(',', '.');

  if (normalizedWeightKg.length === 0) {
    return true;
  }

  const parsedWeightKg = Number(normalizedWeightKg);

  return Number.isFinite(parsedWeightKg) && parsedWeightKg >= 0;
}

function isValidRepsInput(reps: string): boolean {
  const normalizedReps = reps.trim();

  if (normalizedReps.length === 0) {
    return true;
  }

  const parsedReps = Number(normalizedReps);

  return Number.isInteger(parsedReps) && parsedReps > 0;
}
