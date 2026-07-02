import { supabase } from '../supabaseClient';
import type { Json } from '../databaseTypes';
import type { Machine, MuscleGroup } from '../types';

type MachineRow = {
  id: string;
  name: string;
  note: string;
};

type MachineSavePayload = {
  id: string;
  muscleGroups: MuscleGroup[];
  name: string;
  note: string;
};

export async function loadMachines(): Promise<Machine[]> {
  const { data: machineRows, error: machineError } = await supabase
    .from('gymbro_machines')
    .select('id, name, note')
    .order('name', { ascending: true });

  if (machineError) {
    throw machineError;
  }

  const { data: muscleGroupRows, error: muscleGroupError } = await supabase
    .from('gymbro_machine_muscle_groups')
    .select('machine_id, muscle_group');

  if (muscleGroupError) {
    throw muscleGroupError;
  }

  return (machineRows ?? []).map((machineRow) =>
    mapMachineRow(
      machineRow,
      (muscleGroupRows ?? [])
        .filter((row) => row.machine_id === machineRow.id)
        .map((row) => row.muscle_group),
    ),
  );
}

export async function saveMachine(machine: Machine): Promise<void> {
  const { error } = await supabase.rpc('gymbro_save_machine', {
    p_machine: createMachineSavePayload(machine),
  });

  if (error) {
    throw error;
  }
}

export async function deleteMachine(id: string): Promise<void> {
  const { error } = await supabase.from('gymbro_machines').delete().eq('id', id);

  if (error) {
    throw error;
  }
}

function mapMachineRow(
  machineRow: MachineRow,
  muscleGroups: MuscleGroup[],
): Machine {
  return {
    id: machineRow.id,
    name: machineRow.name,
    muscleGroups,
    note: machineRow.note,
  };
}

function createMachineSavePayload(machine: Machine): MachineSavePayload & Json {
  return {
    id: machine.id,
    muscleGroups: machine.muscleGroups,
    name: machine.name,
    note: machine.note,
  };
}
