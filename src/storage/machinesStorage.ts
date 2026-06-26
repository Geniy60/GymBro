import AsyncStorage from '@react-native-async-storage/async-storage';

import { muscleGroups } from '../muscleGroups';
import { standardMachines } from '../standardMachines';
import { strings } from '../strings';
import type { Machine, MuscleGroup } from '../types';

const machinesStorageKey = 'gymbro.machines.v1';
const standardMachinesSeededStorageKey = 'gymbro.standardMachinesSeeded.v1';

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
      await saveSeededMachines(standardMachines);

      return {
        ok: true,
        machines: standardMachines,
      };
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!isStoredMachineList(parsedValue)) {
      return {
        ok: true,
        machines: [],
      };
    }

    const normalizedMachines = parsedValue.map(normalizeStoredMachine);
    const machines = await seedStandardMachinesIfNeeded(normalizedMachines);

    return {
      ok: true,
      machines,
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

type StoredMachine = {
  id: string;
  name: string;
  muscleGroup?: string;
  muscleGroups?: MuscleGroup[];
  note: string;
};

function isStoredMachineList(value: unknown): value is StoredMachine[] {
  return Array.isArray(value) && value.every(isStoredMachine);
}

function isStoredMachine(value: unknown): value is StoredMachine {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const machine = value as Record<string, unknown>;
  const hasLegacyMuscleGroup =
    machine.muscleGroup === undefined || typeof machine.muscleGroup === 'string';
  const hasMuscleGroups =
    machine.muscleGroups === undefined ||
    (Array.isArray(machine.muscleGroups) &&
      machine.muscleGroups.every(isMuscleGroup));

  return (
    typeof machine.id === 'string' &&
    typeof machine.name === 'string' &&
    hasLegacyMuscleGroup &&
    hasMuscleGroups &&
    typeof machine.note === 'string'
  );
}

function normalizeStoredMachine(machine: StoredMachine): Machine {
  return {
    id: machine.id,
    name: machine.name,
    muscleGroups:
      machine.muscleGroups === undefined
        ? parseLegacyMuscleGroups(machine.muscleGroup ?? '')
        : machine.muscleGroups,
    note: machine.note,
  };
}

function isMuscleGroup(value: unknown): value is MuscleGroup {
  return typeof value === 'string' && muscleGroups.includes(value as MuscleGroup);
}

function parseLegacyMuscleGroups(value: string): MuscleGroup[] {
  const normalizedValue = value.trim().toLocaleLowerCase();

  if (normalizedValue.length === 0) {
    return [];
  }

  return muscleGroups.filter((muscleGroup) => {
    const label = strings.muscleGroups.labels[muscleGroup].toLocaleLowerCase();
    const aliases = strings.muscleGroups.legacyAliases[muscleGroup];

    return (
      normalizedValue === label ||
      aliases.some((alias) => normalizedValue.includes(alias))
    );
  });
}

async function seedStandardMachinesIfNeeded(machines: Machine[]) {
  const hasSeededStandardMachines = await AsyncStorage.getItem(
    standardMachinesSeededStorageKey,
  );

  if (hasSeededStandardMachines !== null) {
    return machines;
  }

  const machinesById = new Set(machines.map((machine) => machine.id));
  const machineNames = new Set(
    machines.map((machine) => machine.name.trim().toLocaleLowerCase()),
  );
  const missingStandardMachines = standardMachines.filter((standardMachine) => {
    const normalizedName = standardMachine.name.trim().toLocaleLowerCase();

    return !machinesById.has(standardMachine.id) && !machineNames.has(normalizedName);
  });
  const seededMachines = [...missingStandardMachines, ...machines];

  await saveSeededMachines(seededMachines);

  return seededMachines;
}

async function saveSeededMachines(machines: Machine[]) {
  await AsyncStorage.multiSet([
    [machinesStorageKey, JSON.stringify(machines)],
    [standardMachinesSeededStorageKey, 'true'],
  ]);
}
