import { describe, expect, it } from 'vitest';

import { queryKeys } from './queryClient';

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
});
