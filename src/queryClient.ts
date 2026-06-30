import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const queryKeys = {
  machines: ['machines'] as const,
  users: ['users'] as const,
  workoutHistory: (userId: string) => ['workoutHistory', userId] as const,
  workoutSummaries: (userId: string, searchText: string) =>
    ['workoutSummaries', userId, searchText] as const,
  workoutDetail: (workoutId: string) => ['workoutDetail', workoutId] as const,
  workoutStats: (userId: string) => ['workoutStats', userId] as const,
  machineHistory: (userId: string, machineId: string) =>
    ['machineHistory', userId, machineId] as const,
  previousMachineMaxes: (userId: string, workoutId: string, machineIdsKey: string) =>
    ['previousMachineMaxes', userId, workoutId, machineIdsKey] as const,
};
