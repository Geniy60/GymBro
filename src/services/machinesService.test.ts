import { describe, expect, it, vi } from 'vitest';

vi.mock('../supabaseClient', () => ({
  supabase: {},
}));

import { createMachineSavePayload } from './machinesService';

describe('machinesService payload mapping', () => {
  it('creates the machine RPC payload', () => {
    expect(
      createMachineSavePayload({
        id: 'machine-1',
        muscleGroups: ['chest', 'triceps'],
        name: 'Chest Press',
        note: 'Seat 4',
      }),
    ).toEqual({
      id: 'machine-1',
      muscleGroups: ['chest', 'triceps'],
      name: 'Chest Press',
      note: 'Seat 4',
    });
  });
});
