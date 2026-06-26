export type MainTab = 'machines' | 'workouts';

export type AppScreen = 'home' | 'machineForm' | 'workoutForm';

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
  note: string;
};

export type WorkoutDraft = {
  name: string;
  note: string;
};
