import { describe, expect, it, vi } from 'vitest';

vi.mock('../supabaseClient', () => ({
  supabase: {},
}));

import { createWorkoutSavePayload } from './workoutsService';

describe('workoutsService payload mapping', () => {
  it('creates the RPC payload and normalizes weight input', () => {
    const payload = createWorkoutSavePayload({
      exercises: [
        {
          id: 'exercise-1',
          machineId: 'machine-1',
          machineName: 'Chest Press',
          sets: [
            { id: 'set-1', note: 'good', reps: '10', weightKg: '42,5' },
            { id: 'set-2', note: '', reps: '8', weightKg: '' },
            { id: 'set-3', note: '', reps: '6', weightKg: 'abc' },
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
          sets: [
            { id: 'set-1', note: 'good', reps: '10', weightKg: 42.5 },
            { id: 'set-2', note: '', reps: '8', weightKg: null },
            { id: 'set-3', note: '', reps: '6', weightKg: null },
          ],
        },
      ],
      id: 'workout-1',
      name: 'Workout',
      startedAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
