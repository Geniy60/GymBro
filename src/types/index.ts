export type MainTab = 'machines' | 'stats' | 'workouts';

export type AppScreen =
  | 'home'
  | 'machineForm'
  | 'bodyMeasurements'
  | 'settings'
  | 'themeSettings'
  | 'restTimerSettings'
  | 'userSelect'
  | 'workoutSession';

export type Machine = {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  note: string;
  trackingType: MachineTrackingType;
};

export type MachineDraft = {
  name: string;
  muscleGroups: MuscleGroup[];
  note: string;
  trackingType: MachineTrackingType;
};

export type MachineTrackingType = 'strength' | 'cardio';

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

export type WorkoutSummary = {
  userId: string;
  id: string;
  name: string;
  startedAt: string;
};

export type WorkoutExercise = {
  id: string;
  machineId: string;
  machineName: string;
  trackingType: MachineTrackingType;
  sets: WorkoutSet[];
};

export type WorkoutSet = {
  distanceKm: string;
  durationMinutes: string;
  elevationMeters: string;
  id: string;
  inclinePercent: string;
  note: string;
  reps: string;
  speedKmh: string;
  weightKg: string;
};

export type WorkoutPage = {
  items: WorkoutSummary[];
  nextOffset: number | null;
};

export type MonthWorkoutStat = {
  count: number;
  key: string;
  label: string;
};

export type MachineMax = {
  dateLabel: string;
  id: string;
  machineName: string;
  weightKg: number;
};

export type ExerciseHistorySummary = {
  id: string;
  machineName: string;
  muscleGroups: MuscleGroup[];
  note: string;
  trackingType: MachineTrackingType;
};

export type CardioSummary = {
  dateLabel: string;
  distanceKm: number | null;
  durationSeconds: number | null;
  elevationMeters: number | null;
  id: string;
  machineName: string;
};

export type MachineHistoryItem = {
  dateLabel: string;
  id: string;
  maxWeightKg: number | null;
  setCount: number;
};

export type MachineHistorySet = {
  id: string;
  note: string;
  reps: string;
  setNumber: number;
  weightKg: number | null;
};

export type CardioHistoryItem = CardioSummary;

export type WorkoutStats = {
  totalWorkouts: number;
  monthWorkoutCount: number;
  monthStats: MonthWorkoutStat[];
  exerciseHistoryItems: ExerciseHistorySummary[];
};

export type BodyMeasurement = {
  abdomenCm: number | null;
  chestCm: number | null;
  id: string;
  hipsCm: number | null;
  measuredAt: string;
  userId: string;
  waistCm: number | null;
  weightKg: number | null;
};

export type BodyMeasurementDraft = {
  abdomenCm: string;
  chestCm: string;
  hipsCm: string;
  waistCm: string;
  weightKg: string;
};

export type BodyMeasurementMetric =
  | 'weightKg'
  | 'waistCm'
  | 'hipsCm'
  | 'chestCm'
  | 'abdomenCm';
