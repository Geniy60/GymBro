import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const queryKeys = {
  machines: ['machines'] as const,
  workouts: ['workouts'] as const,
};
