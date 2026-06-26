import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Machine } from '../types';

const machinesStorageKey = 'gymbro.machines.v1';

type LoadMachinesResult =
  | {
      ok: true;
      machines: Machine[];
    }
  | {
      ok: false;
    };

type SaveMachinesResult = {
  ok: boolean;
};

export async function loadMachines(): Promise<LoadMachinesResult> {
  try {
    const storedValue = await AsyncStorage.getItem(machinesStorageKey);

    if (storedValue === null) {
      return {
        ok: true,
        machines: [],
      };
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isMachineList(parsedValue)) {
      return {
        ok: true,
        machines: [],
      };
    }

    return {
      ok: true,
      machines: parsedValue,
    };
  } catch {
    return {
      ok: false,
    };
  }
}

export async function saveMachines(machines: Machine[]): Promise<SaveMachinesResult> {
  try {
    await AsyncStorage.setItem(machinesStorageKey, JSON.stringify(machines));

    return {
      ok: true,
    };
  } catch {
    return {
      ok: false,
    };
  }
}

function isMachineList(value: unknown): value is Machine[] {
  return Array.isArray(value) && value.every(isMachine);
}

function isMachine(value: unknown): value is Machine {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const machine = value as Record<string, unknown>;

  return (
    typeof machine.id === 'string' &&
    typeof machine.name === 'string' &&
    typeof machine.muscleGroup === 'string' &&
    typeof machine.note === 'string'
  );
}
