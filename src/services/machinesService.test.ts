import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: supabaseMock,
}));

import { createMachineSavePayload, loadMachines } from './machinesService';

beforeEach(() => {
  supabaseMock.from.mockReset();
});

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

describe('machinesService read mapping', () => {
  it('loads machines and joins muscle groups by machine id', async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'gymbro_machines') {
        return {
          select: () => ({
            order: async () => ({
              data: [
                { id: 'machine-1', name: 'Chest Press', note: 'Seat 4' },
                { id: 'machine-2', name: 'Leg Press', note: '' },
              ],
              error: null,
            }),
          }),
        };
      }

      return {
        select: async () => ({
          data: [
            { machine_id: 'machine-1', muscle_group: 'chest' },
            { machine_id: 'machine-1', muscle_group: 'triceps' },
            { machine_id: 'machine-2', muscle_group: 'quads' },
          ],
          error: null,
        }),
      };
    });

    await expect(loadMachines()).resolves.toEqual([
      {
        id: 'machine-1',
        muscleGroups: ['chest', 'triceps'],
        name: 'Chest Press',
        note: 'Seat 4',
      },
      {
        id: 'machine-2',
        muscleGroups: ['quads'],
        name: 'Leg Press',
        note: '',
      },
    ]);
  });
});
