export type MainTab = 'machines' | 'workouts';

export type AppScreen = 'home' | 'machineForm';

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
