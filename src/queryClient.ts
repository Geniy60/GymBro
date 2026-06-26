import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient();

export const queryKeys = {
  machines: ['machines'] as const,
  users: ['users'] as const,
  workouts: (userId: string) => ['workouts', userId] as const,
};
