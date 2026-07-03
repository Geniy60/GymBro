import { createId } from '../../createId';
import { strings } from '../../strings';
import type {
  Machine,
  MachineTrackingType,
  MuscleGroup,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '../../types';

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

export function createSetsForMachine(
  machine: Machine,
  historySets: WorkoutSet[] | undefined,
): WorkoutSet[] {
  if (machine.trackingType === 'cardio') {
    return createCardioSetFromHistory(historySets);
  }

  return createSetsFromHistory(historySets);
}

export function createEmptySets(count: number): WorkoutSet[] {
  return Array.from({ length: count }, createEmptySet);
}

export function createEmptySetsForTrackingType(
  trackingType: MachineTrackingType,
  currentSetCount: number,
): WorkoutSet[] {
  if (trackingType === 'cardio') {
    return [createEmptySet()];
  }

  return createEmptySets(currentSetCount > 0 ? currentSetCount : 4);
}

export function addSetToExercise(exercise: WorkoutExercise): WorkoutExercise {
  if (exercise.trackingType === 'cardio') {
    return exercise;
  }

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

      if (!isValidCardioSetInput(workoutSet)) {
        return strings.workouts.invalidCardioMessage;
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

function createCardioSetFromHistory(historySets: WorkoutSet[] | undefined): WorkoutSet[] {
  const historySet = historySets?.[0];

  if (historySet === undefined) {
    return [createEmptySet()];
  }

  return [
    {
      ...historySet,
      id: createId(),
    },
  ];
}

function createEmptySet(): WorkoutSet {
  return {
    distanceKm: '',
    durationMinutes: '',
    elevationMeters: '',
    id: createId(),
    inclinePercent: '',
    note: '',
    reps: '',
    speedKmh: '',
    weightKg: '',
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

function isValidCardioSetInput(workoutSet: WorkoutSet): boolean {
  return [
    workoutSet.durationMinutes,
    workoutSet.distanceKm,
    workoutSet.inclinePercent,
    workoutSet.elevationMeters,
    workoutSet.speedKmh,
  ].every(isValidOptionalNonNegativeNumberInput);
}

function isValidOptionalNonNegativeNumberInput(value: string): boolean {
  const normalizedValue = value.trim().replace(',', '.');

  if (normalizedValue.length === 0) {
    return true;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) && parsedValue >= 0;
}
