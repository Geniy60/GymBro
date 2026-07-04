import { QueryClient } from '@tanstack/react-query';
import type { QueryClient as QueryClientType } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const queryKeys = {
  machines: ['machines'] as const,
  users: ['users'] as const,
  workoutHistory: (userId: string) => ['workoutHistory', userId] as const,
  workoutSummaries: (userId: string, searchText: string) =>
    ['workoutSummaries', userId, searchText] as const,
  workoutDetail: (workoutId: string) => ['workoutDetail', workoutId] as const,
  workoutStats: (userId: string) => ['workoutStats', userId] as const,
  cardioHistory: (userId: string, machineId: string) =>
    ['cardioHistory', userId, machineId] as const,
  machineHistory: (userId: string, machineId: string) =>
    ['machineHistory', userId, machineId] as const,
  bodyMeasurements: (userId: string) => ['bodyMeasurements', userId] as const,
  previousMachineMaxes: (userId: string, workoutId: string, machineIdsKey: string) =>
    ['previousMachineMaxes', userId, workoutId, machineIdsKey] as const,
};

export async function invalidateMachineQueries(
  queryClientInstance: QueryClientType,
): Promise<void> {
  await queryClientInstance.invalidateQueries({ queryKey: queryKeys.machines });
}

export async function invalidateWorkoutQueries(
  queryClientInstance: QueryClientType,
  userId: string,
): Promise<void> {
  await Promise.all([
    queryClientInstance.invalidateQueries({
      queryKey: ['workoutSummaries', userId],
    }),
    queryClientInstance.invalidateQueries({
      queryKey: queryKeys.workoutStats(userId),
    }),
    queryClientInstance.invalidateQueries({
      queryKey: ['cardioHistory', userId],
    }),
    queryClientInstance.invalidateQueries({
      queryKey: ['machineHistory', userId],
    }),
    queryClientInstance.invalidateQueries({
      queryKey: ['previousMachineMaxes', userId],
    }),
  ]);
}
