import { supabase } from '../supabaseClient';
import type { Json } from '../databaseTypes';
import type {
  Workout,
  WorkoutExercise,
  WorkoutPage,
  WorkoutSet,
  WorkoutSummary,
} from '../types';

export const WORKOUT_PAGE_SIZE = 25;

type WorkoutRow = {
  id: string;
  name: string;
  started_at: string;
  user_id: string;
};

type WorkoutExerciseRow = {
  id: string;
  machine_id: string | null;
  machine_name_snapshot: string;
  workout_id: string;
};

type WorkoutSetRow = {
  exercise_id: string;
  id: string;
  note: string;
  reps: string;
  weight_kg: number | null;
};

type PreviousMachineMaxRow = {
  machine_id: string | null;
  max_weight_kg: number;
};

type WorkoutSavePayload = {
  exercises: {
    id: string;
    machineId: string;
    machineName: string;
    sets: {
      id: string;
      note: string;
      reps: string;
      weightKg: number | null;
    }[];
  }[];
  id: string;
  name: string;
  startedAt: string;
};

export async function loadWorkoutSummaries({
  offset,
  searchText,
  userId,
}: {
  offset: number;
  searchText: string;
  userId: string;
}): Promise<WorkoutPage> {
  const trimmedSearchText = searchText.trim();
  const { data, error } = await supabase.rpc('gymbro_search_workout_summaries', {
    p_limit: WORKOUT_PAGE_SIZE + 1,
    p_offset: offset,
    p_search: trimmedSearchText.length === 0 ? null : trimmedSearchText,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as WorkoutRow[];
  const pageRows = rows.slice(0, WORKOUT_PAGE_SIZE);

  return {
    items: pageRows.map(mapWorkoutSummaryRow),
    nextOffset: rows.length > WORKOUT_PAGE_SIZE ? offset + WORKOUT_PAGE_SIZE : null,
  };
}

export async function loadWorkout(workoutId: string): Promise<Workout> {
  const { data: workoutRow, error: workoutError } = await supabase
    .from('gymbro_workouts')
    .select('id, name, started_at, user_id')
    .eq('id', workoutId)
    .single();

  if (workoutError) {
    throw workoutError;
  }

  const exerciseRows = await loadWorkoutExercisesByWorkoutIds([workoutId]);
  const exerciseIds = exerciseRows.map((exercise) => exercise.id);
  const setRows =
    exerciseIds.length === 0 ? [] : await loadWorkoutSetsByExerciseIds(exerciseIds);

  return mapWorkoutRow(workoutRow, exerciseRows, setRows);
}

export async function loadLatestSetsForMachine({
  currentWorkoutId,
  machineId,
  userId,
}: {
  currentWorkoutId: string;
  machineId: string;
  userId: string;
}): Promise<WorkoutSet[]> {
  const { data, error } = await supabase.rpc('gymbro_latest_sets_for_machine', {
    p_excluded_workout_id: currentWorkoutId,
    p_machine_id: machineId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as WorkoutSetRow[]).map(mapWorkoutSetRow);
}

export async function loadPreviousMaxesForMachines({
  currentWorkoutId,
  machineIds,
  userId,
}: {
  currentWorkoutId: string;
  machineIds: string[];
  userId: string;
}): Promise<Map<string, number>> {
  const uniqueMachineIds = [...new Set(machineIds.filter((machineId) => machineId.length > 0))];

  if (uniqueMachineIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.rpc('gymbro_previous_machine_maxes', {
    p_excluded_workout_id: currentWorkoutId,
    p_machine_ids: uniqueMachineIds,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  const previousMaxes = new Map<string, number>();

  for (const row of (data ?? []) as unknown as PreviousMachineMaxRow[]) {
    if (row.machine_id !== null) {
      previousMaxes.set(row.machine_id, row.max_weight_kg);
    }
  }

  return previousMaxes;
}

export async function saveWorkout(workout: Workout, userId: string): Promise<void> {
  const { error } = await supabase.rpc('gymbro_save_workout', {
    p_user_id: userId,
    p_workout: createWorkoutSavePayload(workout),
  });

  if (error) {
    throw error;
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('gymbro_workouts').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

async function loadWorkoutExercisesByWorkoutIds(
  workoutIds: string[],
): Promise<WorkoutExerciseRow[]> {
  const { data, error } = await supabase
    .from('gymbro_workout_exercises')
    .select('id, workout_id, machine_id, machine_name_snapshot')
    .in('workout_id', workoutIds)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function loadWorkoutSetsByExerciseIds(
  exerciseIds: string[],
): Promise<WorkoutSetRow[]> {
  const { data, error } = await supabase
    .from('gymbro_workout_sets')
    .select('id, exercise_id, weight_kg, reps, note')
    .in('exercise_id', exerciseIds)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

function mapWorkoutRow(
  workoutRow: WorkoutRow,
  exerciseRows: WorkoutExerciseRow[],
  setRows: WorkoutSetRow[],
): Workout {
  return {
    exercises: exerciseRows.map((exerciseRow) =>
      mapWorkoutExerciseRow(
        exerciseRow,
        setRows.filter((setRow) => setRow.exercise_id === exerciseRow.id),
      ),
    ),
    id: workoutRow.id,
    name: workoutRow.name,
    startedAt: workoutRow.started_at,
    userId: workoutRow.user_id,
  };
}

function mapWorkoutSummaryRow(workoutRow: WorkoutRow): WorkoutSummary {
  return {
    id: workoutRow.id,
    name: workoutRow.name,
    startedAt: workoutRow.started_at,
    userId: workoutRow.user_id,
  };
}

function mapWorkoutExerciseRow(
  exerciseRow: WorkoutExerciseRow,
  setRows: WorkoutSetRow[],
): WorkoutExercise {
  return {
    id: exerciseRow.id,
    machineId: exerciseRow.machine_id ?? '',
    machineName: exerciseRow.machine_name_snapshot,
    sets: setRows.map(mapWorkoutSetRow),
  };
}

function mapWorkoutSetRow(setRow: WorkoutSetRow): WorkoutSet {
  return {
    id: setRow.id,
    note: setRow.note,
    reps: setRow.reps,
    weightKg: formatWeightKg(setRow.weight_kg),
  };
}

function parseWeightKg(weightKg: string): number | null {
  const normalizedWeightKg = weightKg.trim().replace(',', '.');

  if (normalizedWeightKg.length === 0) {
    return null;
  }

  const parsedWeightKg = Number(normalizedWeightKg);

  return Number.isFinite(parsedWeightKg) ? parsedWeightKg : null;
}

function formatWeightKg(weightKg: number | null): string {
  return weightKg === null ? '' : String(weightKg);
}

function createWorkoutSavePayload(workout: Workout): WorkoutSavePayload & Json {
  return {
    exercises: workout.exercises.map((exercise) => ({
      id: exercise.id,
      machineId: exercise.machineId,
      machineName: exercise.machineName,
      sets: exercise.sets.map((workoutSet) => ({
        id: workoutSet.id,
        note: workoutSet.note,
        reps: workoutSet.reps,
        weightKg: parseWeightKg(workoutSet.weightKg),
      })),
    })),
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
  };
}
