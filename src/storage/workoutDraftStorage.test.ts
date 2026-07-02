import { beforeEach, describe, expect, it, vi } from 'vitest';

const asyncStorageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  removeItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: asyncStorageMock,
}));

import {
  clearWorkoutDraft,
  loadWorkoutDraft,
  saveWorkoutDraft,
  type StoredWorkoutDraft,
} from './workoutDraftStorage';

const validDraft: StoredWorkoutDraft = {
  isNewWorkout: true,
  savedAt: '2026-01-01T10:00:00.000Z',
  userId: 'user-1',
  workout: {
    exercises: [],
    id: 'workout-1',
    name: 'Workout',
    startedAt: '2026-01-01T09:00:00.000Z',
    userId: 'user-1',
  },
};

describe('workoutDraftStorage', () => {
  beforeEach(() => {
    asyncStorageMock.getItem.mockReset();
    asyncStorageMock.removeItem.mockReset();
    asyncStorageMock.setItem.mockReset();
  });

  it('loads a valid stored workout draft', async () => {
    asyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(validDraft));

    await expect(loadWorkoutDraft()).resolves.toEqual(validDraft);
  });

  it('returns null for missing, malformed, or invalid drafts', async () => {
    asyncStorageMock.getItem.mockResolvedValueOnce(null);
    await expect(loadWorkoutDraft()).resolves.toBeNull();

    asyncStorageMock.getItem.mockResolvedValueOnce('{broken');
    await expect(loadWorkoutDraft()).resolves.toBeNull();

    asyncStorageMock.getItem.mockResolvedValueOnce(
      JSON.stringify({ ...validDraft, workout: { id: 'workout-1' } }),
    );
    await expect(loadWorkoutDraft()).resolves.toBeNull();
  });

  it('saves the draft as JSON', async () => {
    await saveWorkoutDraft(validDraft);

    expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
      'gymbro.activeWorkoutDraft.v1',
      JSON.stringify(validDraft),
    );
  });

  it('clears all drafts when no workout id is passed', async () => {
    await clearWorkoutDraft();

    expect(asyncStorageMock.removeItem).toHaveBeenCalledWith(
      'gymbro.activeWorkoutDraft.v1',
    );
  });

  it('clears only the matching workout draft by id', async () => {
    asyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(validDraft));
    await clearWorkoutDraft('workout-1');

    expect(asyncStorageMock.removeItem).toHaveBeenCalledWith(
      'gymbro.activeWorkoutDraft.v1',
    );

    asyncStorageMock.removeItem.mockClear();
    asyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(validDraft));
    await clearWorkoutDraft('other-workout');

    expect(asyncStorageMock.removeItem).not.toHaveBeenCalled();
  });
});
