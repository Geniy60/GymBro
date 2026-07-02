import { beforeEach, describe, expect, it, vi } from 'vitest';

const asyncStorageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: asyncStorageMock,
}));

import { loadSelectedUserId, saveSelectedUserId } from './selectedUserStorage';

describe('selectedUserStorage', () => {
  beforeEach(() => {
    asyncStorageMock.getItem.mockReset();
    asyncStorageMock.setItem.mockReset();
  });

  it('loads the selected user id', async () => {
    asyncStorageMock.getItem.mockResolvedValueOnce('user-1');

    await expect(loadSelectedUserId()).resolves.toBe('user-1');
    expect(asyncStorageMock.getItem).toHaveBeenCalledWith(
      'gymbro.selectedUserId.v1',
    );
  });

  it('saves the selected user id', async () => {
    await saveSelectedUserId('user-1');

    expect(asyncStorageMock.setItem).toHaveBeenCalledWith(
      'gymbro.selectedUserId.v1',
      'user-1',
    );
  });
});
