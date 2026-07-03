import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: supabaseMock,
}));

import { loadCardioHistory } from './workoutStatsService';

beforeEach(() => {
  supabaseMock.from.mockReset();
  supabaseMock.rpc.mockReset();
});

describe('workoutStatsService cardio mapping', () => {
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
