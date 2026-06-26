export type MainTab = 'machines' | 'workouts';

export type AppScreen =
  | 'home'
  | 'machineForm'
  | 'settings'
  | 'userSelect'
  | 'workoutSession';

export type Machine = {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  note: string;
};

export type MachineDraft = {
  name: string;
  muscleGroups: MuscleGroup[];
  note: string;
};

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'traps'
  | 'adductors'
  | 'abductors'
  | 'lowerBack';

export type AppUser = {
  id: string;
  name: string;
};

export type Workout = {
  userId: string;
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
