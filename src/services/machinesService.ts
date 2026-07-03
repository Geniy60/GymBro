import { supabase } from '../supabaseClient';
import type { Json } from '../databaseTypes';
import type { Machine, MachineTrackingType, MuscleGroup } from '../types';

type MachineRow = {
  id: string;
  name: string;
  note: string;
  tracking_type: MachineTrackingType | null;
};

type MachineSavePayload = {
  id: string;
  muscleGroups: MuscleGroup[];
  name: string;
  note: string;
  trackingType: MachineTrackingType;
};

export async function loadMachines(): Promise<Machine[]> {
  const { data: machineRows, error: machineError } = await supabase
    .from('gymbro_machines')
    .select('id, name, note, tracking_type')
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
    trackingType: machineRow.tracking_type ?? 'strength',
  };
}

export function createMachineSavePayload(machine: Machine): MachineSavePayload & Json {
  return {
    id: machine.id,
    muscleGroups: machine.muscleGroups,
    name: machine.name,
    note: machine.note,
    trackingType: machine.trackingType,
  };
}
