import { describe, expect, it, vi } from 'vitest';

const idMock = vi.hoisted(() => {
  const state = {
    values: [] as string[],
  };

  return {
    createId: vi.fn(() => state.values.shift() ?? 'fallback-id'),
    state,
  };
});

vi.mock('../../createId', () => ({
  createId: idMock.createId,
}));

import type { Workout } from '../../types';
import {
  createWorkoutSessionDraftState,
  workoutSessionDraftReducer,
} from './workoutSessionReducer';

const emptyCardioFields = {
  distanceKm: '',
  durationMinutes: '',
  elevationMeters: '',
  inclinePercent: '',
  speedKmh: '',
};

const workout: Workout = {
  exercises: [
    {
      id: 'exercise-1',
      machineId: 'machine-1',
      machineName: 'Chest Press',
      trackingType: 'strength',
      sets: [
        {
          ...emptyCardioFields,
          id: 'set-1',
          note: 'warmup',
          reps: '10',
          weightKg: '50',
        },
        { ...emptyCardioFields, id: 'set-2', note: '', reps: '8', weightKg: '60' },
      ],
    },
  ],
  id: 'workout-1',
  name: 'Workout',
  startedAt: '2026-01-01T10:00:00.000Z',
  userId: 'user-1',
};

describe('workoutSessionDraftReducer', () => {
  it('starts with workout exercises collapsed', () => {
    const state = createWorkoutSessionDraftState(workout);

    expect(state.collapsedExerciseIds).toEqual(['exercise-1']);
  });

  it('updates the workout name', () => {
    const state = workoutSessionDraftReducer(
      createWorkoutSessionDraftState(workout),
      { name: 'Leg day', type: 'updateWorkoutName' },
    );

    expect(state.draftWorkout.name).toBe('Leg day');
  });

  it('adds exercises and collapses existing exercises', () => {
    const state = workoutSessionDraftReducer(
      createWorkoutSessionDraftState(workout),
      {
        exercises: [
          {
            id: 'exercise-2',
            machineId: 'machine-2',
            machineName: 'Leg Press',
            trackingType: 'strength',
            sets: [],
          },
        ],
        type: 'addExercises',
      },
    );

    expect(state.draftWorkout.exercises.map((exercise) => exercise.id)).toEqual([
      'exercise-1',
      'exercise-2',
    ]);
    expect(state.collapsedExerciseIds).toEqual(['exercise-1']);
  });

  it('updates, toggles, and deletes set state', () => {
    let state = workoutSessionDraftReducer(
      createWorkoutSessionDraftState(workout),
      {
        exerciseId: 'exercise-1',
        field: 'weightKg',
        setId: 'set-1',
        type: 'updateSet',
        value: '55',
      },
    );
    state = workoutSessionDraftReducer(state, {
      setId: 'set-1',
      type: 'toggleSetNote',
    });
    state = workoutSessionDraftReducer(state, {
      exerciseId: 'exercise-1',
      setId: 'set-1',
      type: 'deleteSet',
    });

    expect(state.draftWorkout.exercises[0].sets).toEqual([
      { ...emptyCardioFields, id: 'set-2', note: '', reps: '8', weightKg: '60' },
    ]);
    expect(state.visibleSetNoteIds).toEqual([]);
  });

  it('clears only strength repetitions while preserving sets, weights, and notes', () => {
    idMock.state.values = ['set-3'];
    let state = workoutSessionDraftReducer(
      createWorkoutSessionDraftState(workout),
      {
        exerciseId: 'exercise-1',
        type: 'addSet',
      },
    );

    expect(state.draftWorkout.exercises[0].sets[2]).toMatchObject({
      id: 'set-3',
      reps: '8',
      weightKg: '60',
    });

    state = workoutSessionDraftReducer(
      {
        ...state,
        visibleSetNoteIds: ['set-1', 'set-2'],
      },
      {
        exerciseId: 'exercise-1',
        type: 'clearExerciseSets',
      },
    );

    expect(state.draftWorkout.exercises[0].sets).toEqual([
      { ...emptyCardioFields, id: 'set-1', note: 'warmup', reps: '', weightKg: '50' },
      { ...emptyCardioFields, id: 'set-2', note: '', reps: '', weightKg: '60' },
      { ...emptyCardioFields, id: 'set-3', note: '', reps: '', weightKg: '60' },
    ]);
    expect(state.visibleSetNoteIds).toEqual(['set-1', 'set-2']);
    expect(workout.exercises[0].sets[0].reps).toBe('10');
  });

  it('clears cardio distance, elevation, and time while preserving setup and other exercises', () => {
    const cardioWorkout: Workout = {
      ...workout,
      exercises: [
        ...workout.exercises,
        {
          id: 'cardio-exercise',
          machineId: 'treadmill',
          machineName: 'Treadmill',
          trackingType: 'cardio',
          sets: [{
            ...emptyCardioFields,
            id: 'cardio-set',
            distanceKm: '3.2',
            durationMinutes: '25',
            elevationMeters: '80',
            inclinePercent: '4',
            note: 'Steady pace',
            reps: '',
            speedKmh: '7.5',
            weightKg: '',
          }],
        },
      ],
    };
    const state = workoutSessionDraftReducer(
      {
        ...createWorkoutSessionDraftState(cardioWorkout),
        visibleSetNoteIds: ['cardio-set', 'set-1'],
      },
      { exerciseId: 'cardio-exercise', type: 'clearExerciseSets' },
    );

    expect(state.draftWorkout.exercises[1].sets).toEqual([{
      ...cardioWorkout.exercises[1].sets[0],
      distanceKm: '',
      durationMinutes: '',
      elevationMeters: '',
    }]);
    expect(state.draftWorkout.exercises[0]).toBe(cardioWorkout.exercises[0]);
    expect(state.visibleSetNoteIds).toEqual(['cardio-set', 'set-1']);
    expect(cardioWorkout.exercises[1].sets[0].distanceKm).toBe('3.2');
  });

  it('deletes exercises and toggles collapse state', () => {
    let state = workoutSessionDraftReducer(
      {
        ...createWorkoutSessionDraftState(workout),
        collapsedExerciseIds: ['exercise-1'],
      },
      {
        exerciseId: 'exercise-1',
        type: 'toggleExerciseCollapse',
      },
    );

    expect(state.collapsedExerciseIds).toEqual([]);

    state = workoutSessionDraftReducer(state, {
      exerciseId: 'exercise-1',
      type: 'deleteExercise',
    });

    expect(state.draftWorkout.exercises).toEqual([]);
  });
});
