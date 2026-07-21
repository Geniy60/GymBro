import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: supabaseMock,
}));

import {
  loadCardioHistory,
  loadMachineHistorySets,
  loadWorkoutStats,
} from './workoutStatsService';

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.rpc.mockReset();
});

describe('workoutStatsService cardio mapping', () => {
  it('loads all exercises into one history list without loading maxes', async () => {
    let workoutsQueryCount = 0;
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'gymbro_machines') {
        return createThenableQuery({
          data: [
            {
              id: 'standard-chest-press',
              name: 'Chest Press',
              note: 'Machine note',
              tracking_type: 'strength',
            },
            {
              id: 'standard-leg-press',
              name: 'Leg Press',
              note: '',
              tracking_type: 'strength',
            },
            {
              id: 'standard-treadmill',
              name: 'Treadmill',
              note: '',
              tracking_type: 'cardio',
            },
          ],
          error: null,
        });
      }

      if (table === 'gymbro_machine_muscle_groups') {
        return createThenableQuery({
          data: [
            {
              machine_id: 'standard-chest-press',
              muscle_group: 'chest',
            },
            {
              machine_id: 'standard-leg-press',
              muscle_group: 'quads',
            },
          ],
          error: null,
        });
      }

      workoutsQueryCount += 1;
      if (workoutsQueryCount <= 2) {
        return createThenableQuery({ count: workoutsQueryCount, error: null });
      }

      return createThenableQuery({
        data: [{ started_at: '2026-01-01T10:00:00.000Z' }],
        error: null,
      });
    });
    supabaseMock.rpc.mockImplementation((name: string) => {
      return Promise.resolve({ data: [], error: null });
    });

    const stats = await loadWorkoutStats('user-1');

    expect(stats.exerciseHistoryItems).toEqual([
      {
        id: 'standard-chest-press',
        machineName: 'Chest Press',
        muscleGroups: ['chest'],
        note: 'Machine note',
        trackingType: 'strength',
      },
      {
        id: 'standard-leg-press',
        machineName: 'Leg Press',
        muscleGroups: ['quads'],
        note: '',
        trackingType: 'strength',
      },
      {
        id: 'standard-treadmill',
        machineName: 'Treadmill',
        muscleGroups: [],
        note: '',
        trackingType: 'cardio',
      },
    ]);
    expect(supabaseMock.rpc).not.toHaveBeenCalledWith(
      'gymbro_machine_maxes',
      expect.anything(),
    );
  });

  it('loads cardio history with distance, elevation, and duration', async () => {
    supabaseMock.rpc.mockResolvedValueOnce({
      data: [
        {
          distance_km: 3.2,
          duration_seconds: 1500,
          elevation_meters: 80,
          id: 'exercise-1',
          machine_id: 'standard-treadmill',
          machine_name: 'Treadmill',
          started_at: '2026-01-01T10:00:00.000Z',
        },
      ],
      error: null,
    });

    await expect(
      loadCardioHistory({
        machineId: 'standard-treadmill',
        userId: 'user-1',
      }),
    ).resolves.toEqual([
      {
        dateLabel: '01.01.2026',
        distanceKm: 3.2,
        durationSeconds: 1500,
        elevationMeters: 80,
        id: 'exercise-1',
        machineName: 'Treadmill',
        startedAt: '2026-01-01T10:00:00.000Z',
      },
    ]);
    expect(supabaseMock.rpc).toHaveBeenCalledWith('gymbro_cardio_history', {
      p_machine_id: 'standard-treadmill',
      p_user_id: 'user-1',
    });
  });

  it('loads sets for one expanded strength history entry', async () => {
    supabaseMock.rpc.mockResolvedValueOnce({
      data: [
        {
          id: 'set-1',
          note: 'Controlled tempo',
          reps: '12',
          set_number: 1,
          weight_kg: 50,
        },
      ],
      error: null,
    });

    await expect(
      loadMachineHistorySets({
        historyItemId: 'workout-1-exercise-1',
        userId: 'user-1',
      }),
    ).resolves.toEqual([
      {
        id: 'set-1',
        note: 'Controlled tempo',
        reps: '12',
        setNumber: 1,
        weightKg: 50,
      },
    ]);
    expect(supabaseMock.rpc).toHaveBeenCalledWith('gymbro_machine_history_sets', {
      p_history_item_id: 'workout-1-exercise-1',
      p_user_id: 'user-1',
    });
  });
});

function createThenableQuery<T>(result: T) {
  const query = {
    eq: () => query,
    gte: () => query,
    lt: () => query,
    order: () => query,
    select: () => query,
    then: (resolve: (value: T) => unknown, reject: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };

  return query;
}
