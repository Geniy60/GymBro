export type MainTab = 'machines' | 'workouts';

export type AppScreen = 'home' | 'machineForm' | 'workoutSession';

export type Machine = {
  id: string;
  name: string;
  muscleGroup: string;
  note: string;
};

export type MachineDraft = {
  name: string;
  muscleGroup: string;
  note: string;
};

export type Workout = {
  id: string;
  name: string;
  startedAt: string;
  exercises: WorkoutExercise[];
};

export type WorkoutExercise = {
  id: string;
  machineId: string;
  machineName: string;
  sets: WorkoutSet[];
};

export type WorkoutSet = {
  id: string;
  weightKg: string;
  reps: string;
  note: string;
};
