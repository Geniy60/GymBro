import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: supabaseMock,
}));

import {
  createWorkoutSavePayload,
  loadLatestSetsForMachine,
  loadPreviousMaxesForMachines,
  loadWorkout,
  loadWorkoutSummaries,
} from './workoutsService';

const emptyCardioFields = {
  distanceKm: '',
  durationMinutes: '',
  elevationMeters: '',
  inclinePercent: '',
  speedKmh: '',
};

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.rpc.mockReset();
});

describe('workoutsService payload mapping', () => {
  it('creates the RPC payload and normalizes weight input', () => {
    const payload = createWorkoutSavePayload({
      exercises: [
        {
          id: 'exercise-1',
          machineId: 'machine-1',
          machineName: 'Chest Press',
          trackingType: 'strength',
          sets: [
            {
              ...emptyCardioFields,
              id: 'set-1',
              note: 'good',
              reps: '10',
              weightKg: '42,5',
            },
            { ...emptyCardioFields, id: 'set-2', note: '', reps: '8', weightKg: '' },
            { ...emptyCardioFields, id: 'set-3', note: '', reps: '6', weightKg: 'abc' },
          ],
        },
        {
          id: 'exercise-2',
          machineId: 'treadmill',
          machineName: 'Treadmill',
          trackingType: 'cardio',
          sets: [
            {
              ...emptyCardioFields,
              distanceKm: '3,2',
              durationMinutes: '25',
              elevationMeters: '80',
              id: 'set-4',
              inclinePercent: '4',
              note: '',
              reps: '',
              speedKmh: '7.5',
              weightKg: '',
            },
          ],
        },
      ],
      id: 'workout-1',
      name: 'Workout',
      startedAt: '2026-01-01T00:00:00.000Z',
      userId: 'user-1',
    });

    expect(payload).toEqual({
      exercises: [
        {
          id: 'exercise-1',
          machineId: 'machine-1',
          machineName: 'Chest Press',
          trackingType: 'strength',
          sets: [
            {
              distanceKm: null,
              durationSeconds: null,
              elevationMeters: null,
              id: 'set-1',
              inclinePercent: null,
              note: 'good',
              reps: '10',
              speedKmh: null,
              weightKg: 42.5,
            },
            {
              distanceKm: null,
              durationSeconds: null,
              elevationMeters: null,
              id: 'set-2',
              inclinePercent: null,
              note: '',
              reps: '8',
              speedKmh: null,
              weightKg: null,
            },
            {
              distanceKm: null,
              durationSeconds: null,
              elevationMeters: null,
              id: 'set-3',
              inclinePercent: null,
              note: '',
              reps: '6',
              speedKmh: null,
              weightKg: null,
            },
          ],
        },
        {
          id: 'exercise-2',
          machineId: 'treadmill',
          machineName: 'Treadmill',
          trackingType: 'cardio',
          sets: [
            {
              distanceKm: 3.2,
              durationSeconds: 1500,
              elevationMeters: 80,
              id: 'set-4',
              inclinePercent: 4,
              note: '',
              reps: '',
              speedKmh: 7.5,
              weightKg: null,
            },
          ],
        },
      ],
      id: 'workout-1',
      name: 'Workout',
      startedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});

describe('workoutsService read mapping', () => {
  it('loads paged workout summaries and trims search text', async () => {
    const rows = Array.from({ length: 26 }, (_, index) => ({
      id: `workout-${index + 1}`,
      name: `Workout ${index + 1}`,
      started_at: `2026-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      user_id: 'user-1',
    }));
    supabaseMock.rpc.mockResolvedValueOnce({ data: rows, error: null });

    const page = await loadWorkoutSummaries({
      offset: 0,
      searchText: ' press ',
      userId: 'user-1',
    });

    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      'gymbro_search_workout_summaries',
      {
        p_limit: 26,
        p_offset: 0,
        p_search: 'press',
        p_user_id: 'user-1',
      },
    );
    expect(page.items).toHaveLength(25);
    expect(page.items[0]).toEqual({
      id: 'workout-1',
      name: 'Workout 1',
      startedAt: '2026-01-01T00:00:00.000Z',
      userId: 'user-1',
    });
    expect(page.nextOffset).toBe(25);
  });

  it('loads latest sets and formats nullable weights for UI input', async () => {
    supabaseMock.rpc.mockResolvedValueOnce({
      data: [
        {
          exercise_id: 'exercise-1',
          id: 'set-1',
          note: 'controlled',
          reps: '10',
          weight_kg: 42.5,
          duration_seconds: null,
          distance_km: null,
          incline_percent: null,
          elevation_meters: null,
          speed_kmh: null,
        },
        {
          exercise_id: 'exercise-1',
          id: 'set-2',
          note: '',
          reps: '8',
          weight_kg: null,
          duration_seconds: 1500,
          distance_km: 3.2,
          incline_percent: 4,
          elevation_meters: 80,
          speed_kmh: 7.5,
        },
      ],
      error: null,
    });

    await expect(
      loadLatestSetsForMachine({
        currentWorkoutId: 'workout-1',
        machineId: 'machine-1',
        userId: 'user-1',
      }),
    ).resolves.toEqual([
      {
        ...emptyCardioFields,
        id: 'set-1',
        note: 'controlled',
        reps: '10',
        weightKg: '42.5',
      },
      {
        distanceKm: '3.2',
        durationMinutes: '25',
        elevationMeters: '80',
        id: 'set-2',
        inclinePercent: '4',
        note: '',
        reps: '8',
        speedKmh: '7.5',
        weightKg: '',
      },
    ]);
  });

  it('loads previous maxes with unique non-empty machine ids', async () => {
    supabaseMock.rpc.mockResolvedValueOnce({
      data: [
        { machine_id: 'machine-1', max_weight_kg: 100 },
        { machine_id: null, max_weight_kg: 999 },
      ],
      error: null,
    });

    const previousMaxes = await loadPreviousMaxesForMachines({
      currentWorkoutId: 'workout-1',
      machineIds: ['machine-1', '', 'machine-1'],
      userId: 'user-1',
    });

    expect(supabaseMock.rpc).toHaveBeenCalledWith(
      'gymbro_previous_machine_maxes',
      {
        p_excluded_workout_id: 'workout-1',
        p_machine_ids: ['machine-1'],
        p_user_id: 'user-1',
      },
    );
    expect([...previousMaxes.entries()]).toEqual([['machine-1', 100]]);
  });

  it('loads a workout detail with exercises and sets', async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'gymbro_workouts') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: {
                  id: 'workout-1',
                  name: 'Push day',
                  started_at: '2026-01-01T10:00:00.000Z',
                  user_id: 'user-1',
                },
                error: null,
              }),
            }),
          }),
        };
      }

      if (table === 'gymbro_workout_exercises') {
        return {
          select: () => ({
            in: () => ({
              order: async () => ({
                data: [
                  {
                    id: 'exercise-1',
                    machine_id: 'machine-1',
                    machine_name_snapshot: 'Chest Press',
                    tracking_type: 'strength',
                    workout_id: 'workout-1',
                  },
                ],
                error: null,
              }),
            }),
          }),
        };
      }

      return {
        select: () => ({
          in: () => ({
            order: async () => ({
              data: [
                {
                  exercise_id: 'exercise-1',
                  distance_km: null,
                  duration_seconds: null,
                  elevation_meters: null,
                  id: 'set-1',
                  incline_percent: null,
                  note: 'good',
                  reps: '10',
                  speed_kmh: null,
                  weight_kg: 50,
                },
              ],
              error: null,
            }),
          }),
        }),
      };
    });

    await expect(loadWorkout('workout-1')).resolves.toEqual({
      exercises: [
        {
          id: 'exercise-1',
          machineId: 'machine-1',
          machineName: 'Chest Press',
          trackingType: 'strength',
          sets: [
            { ...emptyCardioFields, id: 'set-1', note: 'good', reps: '10', weightKg: '50' },
          ],
        },
      ],
      id: 'workout-1',
      name: 'Push day',
      startedAt: '2026-01-01T10:00:00.000Z',
      userId: 'user-1',
    });
  });
});
