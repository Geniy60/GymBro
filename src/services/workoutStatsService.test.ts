import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: supabaseMock,
}));

import { loadCardioHistory, loadWorkoutStats } from './workoutStatsService';

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
              tracking_type: 'strength',
            },
            {
              id: 'standard-leg-press',
              name: 'Leg Press',
              tracking_type: 'strength',
            },
            {
              id: 'standard-treadmill',
              name: 'Treadmill',
              tracking_type: 'cardio',
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
        trackingType: 'strength',
      },
      {
        id: 'standard-leg-press',
        machineName: 'Leg Press',
        trackingType: 'strength',
      },
      {
        id: 'standard-treadmill',
        machineName: 'Treadmill',
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
      },
    ]);
    expect(supabaseMock.rpc).toHaveBeenCalledWith('gymbro_cardio_history', {
      p_machine_id: 'standard-treadmill',
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
