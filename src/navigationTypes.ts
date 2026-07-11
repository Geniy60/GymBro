import type { Machine, Workout } from './types';

export type RootStackParamList = {
  Home: undefined;
  UserSelect: undefined;
  Settings: undefined;
  ThemeSettings: undefined;
  RestTimerSettings: undefined;
  BodyMeasurements: undefined;
  MachineForm: { machine: Machine | null };
  WorkoutSession: { isNewWorkout: boolean; workout: Workout };
};
