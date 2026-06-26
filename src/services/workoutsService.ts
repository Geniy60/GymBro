import { supabase } from '../supabaseClient';
import type { Workout, WorkoutExercise, WorkoutSet } from '../types';

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
  weight_kg: string;
};

export async function loadWorkouts(userId: string): Promise<Workout[]> {
  const { data: workoutRows, error: workoutError } = await supabase
    .from('gymbro_workouts')
    .select('id, name, started_at, user_id')
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (workoutError) {
    throw workoutError;
  }

  const workoutIds = (workoutRows ?? []).map((workout) => workout.id);

  if (workoutIds.length === 0) {
    return [];
  }

  const { data: exerciseRows, error: exerciseError } = await supabase
    .from('gymbro_workout_exercises')
    .select('id, workout_id, machine_id, machine_name_snapshot')
    .in('workout_id', workoutIds)
    .order('sort_order', { ascending: true });

  if (exerciseError) {
    throw exerciseError;
  }

  const exerciseIds = (exerciseRows ?? []).map((exercise) => exercise.id);
  const setRows =
    exerciseIds.length === 0 ? [] : await loadWorkoutSetsByExerciseIds(exerciseIds);

  return (workoutRows ?? []).map((workoutRow) =>
    mapWorkoutRow(
      workoutRow,
      (exerciseRows ?? []).filter(
        (exerciseRow) => exerciseRow.workout_id === workoutRow.id,
      ),
      setRows,
    ),
  );
}

export async function saveWorkout(workout: Workout, userId: string): Promise<void> {
  const { error: workoutError } = await supabase.from('gymbro_workouts').upsert({
    id: workout.id,
    name: workout.name,
    started_at: workout.startedAt,
    user_id: userId,
  });

  if (workoutError) {
    throw workoutError;
  }

  const { error: deleteExercisesError } = await supabase
    .from('gymbro_workout_exercises')
    .delete()
    .eq('workout_id', workout.id);

  if (deleteExercisesError) {
    throw deleteExercisesError;
  }

  if (workout.exercises.length === 0) {
    return;
  }

  const { error: insertExercisesError } = await supabase
    .from('gymbro_workout_exercises')
    .insert(
      workout.exercises.map((exercise, index) => ({
        id: exercise.id,
        workout_id: workout.id,
        machine_id: exercise.machineId.length > 0 ? exercise.machineId : null,
        machine_name_snapshot: exercise.machineName,
        sort_order: index,
      })),
    );

  if (insertExercisesError) {
    throw insertExercisesError;
  }

  const workoutSets = workout.exercises.flatMap((exercise) =>
    exercise.sets.map((workoutSet, index) => ({
      exercise_id: exercise.id,
      id: workoutSet.id,
      note: workoutSet.note,
      reps: workoutSet.reps,
      sort_order: index,
      weight_kg: workoutSet.weightKg,
    })),
  );

  if (workoutSets.length === 0) {
    return;
  }

  const { error: insertSetsError } = await supabase
    .from('gymbro_workout_sets')
    .insert(workoutSets);

  if (insertSetsError) {
    throw insertSetsError;
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await supabase.from('gymbro_workouts').delete().eq('id', id);

  if (error) {
    throw error;
  }
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
    id: workoutRow.id,
    userId: workoutRow.user_id,
    name: workoutRow.name,
    startedAt: workoutRow.started_at,
    exercises: exerciseRows.map((exerciseRow) =>
      mapWorkoutExerciseRow(
        exerciseRow,
        setRows.filter((setRow) => setRow.exercise_id === exerciseRow.id),
      ),
    ),
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
    weightKg: setRow.weight_kg,
    reps: setRow.reps,
    note: setRow.note,
  };
}
