import { describe, expect, it, vi } from 'vitest';

import {
  invalidateMachineQueries,
  invalidateWorkoutQueries,
  queryKeys,
} from './queryClient';

describe('queryKeys', () => {
  it('keeps stable keys for core server data', () => {
    expect(queryKeys.machines).toEqual(['machines']);
    expect(queryKeys.users).toEqual(['users']);
    expect(queryKeys.workoutSummaries('user-1', 'press'))
      .toEqual(['workoutSummaries', 'user-1', 'press']);
    expect(queryKeys.workoutDetail('workout-1'))
      .toEqual(['workoutDetail', 'workout-1']);
    expect(queryKeys.workoutStats('user-1')).toEqual(['workoutStats', 'user-1']);
    expect(queryKeys.machineHistory('user-1', 'machine-1'))
      .toEqual(['machineHistory', 'user-1', 'machine-1']);
    expect(queryKeys.previousMachineMaxes('user-1', 'workout-1', 'a|b'))
      .toEqual(['previousMachineMaxes', 'user-1', 'workout-1', 'a|b']);
  });

  it('centralizes machine and workout invalidation keys', async () => {
    const queryClient = {
      invalidateQueries: vi.fn().mockResolvedValue(undefined),
    };

    const typedQueryClient =
      queryClient as unknown as Parameters<typeof invalidateMachineQueries>[0];

    await invalidateMachineQueries(typedQueryClient);
    await invalidateWorkoutQueries(typedQueryClient, 'user-1');

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.machines,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['workoutSummaries', 'user-1'],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.workoutStats('user-1'),
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['machineHistory', 'user-1'],
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ['previousMachineMaxes', 'user-1'],
    });
  });
});
