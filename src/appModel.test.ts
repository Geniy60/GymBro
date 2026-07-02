import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const idMock = vi.hoisted(() => {
  const state = {
    values: [] as string[],
  };

  return {
    createId: vi.fn(() => state.values.shift() ?? 'fallback-id'),
    state,
  };
});

vi.mock('./createId', () => ({
  createId: idMock.createId,
}));

import {
  createNewWorkout,
  createRepeatedWorkout,
  getUserBackgroundColor,
} from './appModel';
import { colors } from './theme/colors';
import type { Workout } from './types';

describe('appModel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T10:30:00.000Z'));
    idMock.state.values = [];
    idMock.createId.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a new workout for the selected user', () => {
    idMock.state.values = ['workout-id'];

    const workout = createNewWorkout('user-1');

    expect(workout).toMatchObject({
      exercises: [],
      id: 'workout-id',
      startedAt: '2026-01-15T10:30:00.000Z',
      userId: 'user-1',
    });
    expect(workout.name).toContain('15.01.2026');
  });

  it('creates a repeated workout with fresh workout, exercise, and set ids', () => {
    idMock.state.values = ['new-workout', 'new-exercise', 'new-set-1', 'new-set-2'];
    const sourceWorkout: Workout = {
      exercises: [
        {
          id: 'old-exercise',
          machineId: 'machine-1',
          machineName: 'Chest Press',
          sets: [
            { id: 'old-set-1', note: 'first', reps: '10', weightKg: '50' },
            { id: 'old-set-2', note: '', reps: '8', weightKg: '55' },
          ],
        },
      ],
      id: 'old-workout',
      name: 'Old workout',
      startedAt: '2025-12-01T08:00:00.000Z',
      userId: 'old-user',
    };

    const repeatedWorkout = createRepeatedWorkout({
      sourceWorkout,
      userId: 'new-user',
    });

    expect(repeatedWorkout.id).toBe('new-workout');
    expect(repeatedWorkout.userId).toBe('new-user');
    expect(repeatedWorkout.startedAt).toBe('2026-01-15T10:30:00.000Z');
    expect(repeatedWorkout.exercises[0]).toMatchObject({
      id: 'new-exercise',
      machineId: 'machine-1',
      machineName: 'Chest Press',
    });
    expect(repeatedWorkout.exercises[0].sets.map((workoutSet) => workoutSet.id))
      .toEqual(['new-set-1', 'new-set-2']);
    expect(repeatedWorkout.exercises[0].sets[0]).toMatchObject({
      note: 'first',
      reps: '10',
      weightKg: '50',
    });
  });

  it('returns the user-specific app background color', () => {
    expect(getUserBackgroundColor('gymbro-user-nastya')).toBe(colors.nastyaBackground);
    expect(getUserBackgroundColor('gymbro-user-zhenya')).toBe(colors.zhenyaBackground);
    expect(getUserBackgroundColor(null)).toBe(colors.background);
    expect(getUserBackgroundColor('unknown-user')).toBe(colors.background);
  });
});
