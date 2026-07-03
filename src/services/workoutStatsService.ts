import { supabase } from '../supabaseClient';
import type {
  CardioHistoryItem,
  CardioSummary,
  ExerciseHistorySummary,
  MachineHistoryItem,
  MonthWorkoutStat,
  WorkoutStats,
} from '../types';

type MachineMaxRow = {
  machine_id: string | null;
  machine_name: string;
  started_at: string;
  weight_kg: number;
};

type MachineHistoryRow = {
  id: string;
  max_weight_kg: number | null;
  set_count: number;
  started_at: string;
};

type CardioRow = {
  distance_km: number | null;
  duration_seconds: number | null;
  elevation_meters: number | null;
  id?: string;
  machine_id: string | null;
  machine_name: string;
  started_at: string;
};

type CardioSummaryRow = {
  machine_id: string | null;
  machine_name: string;
  started_at: string;
};

export async function loadWorkoutStats(userId: string): Promise<WorkoutStats> {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const firstChartMonthStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const [
    totalWorkouts,
    monthWorkoutCount,
    monthStats,
    strengthHistoryItems,
    cardioHistoryItems,
  ] =
    await Promise.all([
      countWorkouts(userId),
      countWorkouts(userId, currentMonthStart, nextMonthStart),
      loadMonthWorkoutStats(userId, firstChartMonthStart),
      loadStrengthHistorySummaries(userId),
      loadCardioHistorySummaries(userId),
    ]);

  return {
    exerciseHistoryItems: sortExerciseHistoryItems([
      ...strengthHistoryItems,
      ...cardioHistoryItems,
    ]),
    monthStats,
    monthWorkoutCount,
    totalWorkouts,
  };
}

export async function loadCardioHistory({
  machineId,
  userId,
}: {
  machineId: string;
  userId: string;
}): Promise<CardioHistoryItem[]> {
  const { data, error } = await supabase.rpc('gymbro_cardio_history', {
    p_machine_id: machineId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as CardioRow[]).map((row) =>
    mapCardioRow(row, row.id ?? `${row.machine_id ?? 'cardio'}-${row.started_at}`),
  );
}

export async function loadMachineHistory({
  machineId,
  userId,
}: {
  machineId: string;
  userId: string;
}): Promise<MachineHistoryItem[]> {
  const { data, error } = await supabase.rpc('gymbro_machine_history', {
    p_machine_id: machineId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as MachineHistoryRow[]).map((row) => ({
    dateLabel: formatDateLabel(row.started_at),
    id: row.id,
    maxWeightKg: row.max_weight_kg,
    setCount: row.set_count,
  }));
}

async function loadCardioHistorySummaries(
  userId: string,
): Promise<ExerciseHistorySummary[]> {
  const { data, error } = await supabase.rpc('gymbro_cardio_history_summaries', {
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as CardioSummaryRow[])
    .filter((row): row is CardioSummaryRow & { machine_id: string } => row.machine_id !== null)
    .map((row) => ({
      id: row.machine_id,
      machineName: row.machine_name,
      trackingType: 'cardio',
    }));
}

async function countWorkouts(
  userId: string,
  startedAtFrom?: Date,
  startedAtTo?: Date,
): Promise<number> {
  let query = supabase
    .from('gymbro_workouts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (startedAtFrom !== undefined) {
    query = query.gte('started_at', startedAtFrom.toISOString());
  }

  if (startedAtTo !== undefined) {
    query = query.lt('started_at', startedAtTo.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function loadMonthWorkoutStats(
  userId: string,
  firstMonthStart: Date,
): Promise<MonthWorkoutStat[]> {
  const { data, error } = await supabase
    .from('gymbro_workouts')
    .select('started_at')
    .eq('user_id', userId)
    .gte('started_at', firstMonthStart.toISOString());

  if (error) {
    throw error;
  }

  const workoutRows = data ?? [];

  return getLastSixMonthStarts().map((monthStart) => {
    const month = monthStart.getMonth();
    const year = monthStart.getFullYear();

    return {
      count: workoutRows.filter((workout) => {
        const workoutDate = new Date(workout.started_at);

        return (
          !Number.isNaN(workoutDate.getTime()) &&
          workoutDate.getMonth() === month &&
          workoutDate.getFullYear() === year
        );
      }).length,
      key: `${year}-${month}`,
      label: monthStart.toLocaleDateString('ru-RU', { month: 'short' }),
    };
  });
}

async function loadStrengthHistorySummaries(
  userId: string,
): Promise<ExerciseHistorySummary[]> {
  const { data, error } = await supabase.rpc('gymbro_machine_maxes', {
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as MachineMaxRow[])
    .filter((row): row is MachineMaxRow & { machine_id: string } => row.machine_id !== null)
    .map((row) => ({
      id: row.machine_id,
      machineName: row.machine_name,
      maxDateLabel: formatDateLabel(row.started_at),
      maxWeightKg: row.weight_kg,
      trackingType: 'strength',
    }));
}

function getLastSixMonthStarts(): Date[] {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (5 - index));

    return date;
  });
}

function formatDateLabel(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('ru-RU');
}

function mapCardioRow(row: CardioRow, id: string): CardioSummary {
  return {
    dateLabel: formatDateLabel(row.started_at),
    distanceKm: row.distance_km,
    durationSeconds: row.duration_seconds,
    elevationMeters: row.elevation_meters,
    id,
    machineName: row.machine_name,
  };
}

function sortExerciseHistoryItems(
  items: ExerciseHistorySummary[],
): ExerciseHistorySummary[] {
  return items.slice().sort((left, right) =>
    left.machineName.localeCompare(right.machineName, 'ru-RU'),
  );
}
