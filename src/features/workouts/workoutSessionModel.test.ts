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

import type { Machine, Workout, WorkoutExercise, WorkoutSet } from '../../types';
import {
  addSetToExercise,
  createEmptySets,
  createSetsFromHistory,
  filterMachines,
  hasWorkoutChanged,
  normalizeWorkoutForSave,
  pickSuggestedMachines,
  shouldConfirmExitWorkout,
} from './workoutSessionModel';

const machines: Machine[] = [
  {
    id: 'chest-press',
    muscleGroups: ['chest', 'triceps'],
    name: 'Chest Press',
    note: 'plate loaded',
  },
  {
    id: 'leg-press',
    muscleGroups: ['quads', 'glutes'],
    name: 'Leg Press',
    note: 'wide platform',
  },
  {
    id: 'lat-pulldown',
    muscleGroups: ['back', 'biceps'],
    name: 'Lat Pulldown',
    note: '',
  },
];

describe('workoutSessionModel', () => {
  it('filters machines by name, muscle group label, and note', () => {
    expect(filterMachines(machines, 'press').map((machine) => machine.id))
      .toEqual(['chest-press', 'leg-press']);
    expect(filterMachines(machines, 'ягодицы').map((machine) => machine.id))
      .toEqual(['leg-press']);
    expect(filterMachines(machines, 'plate').map((machine) => machine.id))
      .toEqual(['chest-press']);
    expect(filterMachines(machines, '   ')).toEqual(machines);
  });

  it('picks suggested machines from selected muscle groups and excludes current workout machines', () => {
    const randomSpy = vi
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.1);
    const workout: Workout = {
      exercises: [
        {
          id: 'existing',
          machineId: 'chest-press',
          machineName: 'Chest Press',
          sets: [],
        },
      ],
      id: 'workout',
      name: 'Workout',
      startedAt: '2026-01-01T00:00:00.000Z',
      userId: 'user',
    };

    const suggestedMachines = pickSuggestedMachines({
      count: 2,
      machines,
      selectedMuscleGroups: ['quads', 'back'],
      workout,
    });

    expect(suggestedMachines.map((machine) => machine.id))
      .toEqual(['lat-pulldown', 'leg-press']);
    randomSpy.mockRestore();
  });

  it('creates empty sets with fresh ids', () => {
    idMock.state.values = ['set-1', 'set-2'];

    expect(createEmptySets(2)).toEqual([
      { id: 'set-1', note: '', reps: '', weightKg: '' },
      { id: 'set-2', note: '', reps: '', weightKg: '' },
    ]);
  });

  it('copies history sets with fresh ids and falls back to four empty sets', () => {
    const historySets: WorkoutSet[] = [
      { id: 'old-set', note: 'controlled', reps: '10', weightKg: '42.5' },
    ];
    idMock.state.values = ['new-history-set'];

    expect(createSetsFromHistory(historySets)).toEqual([
      { id: 'new-history-set', note: 'controlled', reps: '10', weightKg: '42.5' },
    ]);

    idMock.state.values = ['a', 'b', 'c', 'd'];
    expect(createSetsFromHistory(undefined).map((workoutSet) => workoutSet.id))
      .toEqual(['a', 'b', 'c', 'd']);
  });

  it('adds a set by copying previous weight and reps', () => {
    const exercise: WorkoutExercise = {
      id: 'exercise',
      machineId: 'machine',
      machineName: 'Machine',
      sets: [{ id: 'set-1', note: 'note', reps: '8', weightKg: '60' }],
    };
    idMock.state.values = ['set-2'];

    expect(addSetToExercise(exercise).sets).toEqual([
      { id: 'set-1', note: 'note', reps: '8', weightKg: '60' },
      { id: 'set-2', note: '', reps: '8', weightKg: '60' },
    ]);
  });

  it('normalizes workout names and detects meaningful changes', () => {
    const savedWorkout: Workout = {
      exercises: [],
      id: 'workout',
      name: 'Workout',
      startedAt: '2026-01-01T00:00:00.000Z',
      userId: 'user',
    };

    expect(normalizeWorkoutForSave({ ...savedWorkout, name: '   ' }).name)
      .toBe('Тренировка');
    expect(hasWorkoutChanged(savedWorkout, { ...savedWorkout, name: 'Workout   ' }))
      .toBe(false);
    expect(hasWorkoutChanged(savedWorkout, { ...savedWorkout, name: 'Leg day' }))
      .toBe(true);
  });

  it('confirms exit only for meaningful workout drafts', () => {
    const savedWorkout: Workout = {
      exercises: [],
      id: 'workout',
      name: 'Workout',
      startedAt: '2026-01-01T00:00:00.000Z',
      userId: 'user',
    };

    expect(shouldConfirmExitWorkout(true, savedWorkout, savedWorkout)).toBe(false);
    expect(
      shouldConfirmExitWorkout(true, savedWorkout, {
        ...savedWorkout,
        exercises: [
          {
            id: 'exercise',
            machineId: 'machine',
            machineName: 'Machine',
            sets: [],
          },
        ],
      }),
    ).toBe(true);
    expect(shouldConfirmExitWorkout(false, savedWorkout, savedWorkout)).toBe(false);
    expect(
      shouldConfirmExitWorkout(false, savedWorkout, {
        ...savedWorkout,
        name: 'Changed',
      }),
    ).toBe(true);
  });
});
