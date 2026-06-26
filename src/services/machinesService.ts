import { supabase } from '../supabaseClient';
import type { Machine, MuscleGroup } from '../types';

type MachineRow = {
  id: string;
  name: string;
  note: string;
};

export async function loadMachines(): Promise<Machine[]> {
  const { data: machineRows, error: machineError } = await supabase
    .from('gymbro_machines')
    .select('id, name, note')
    .order('sort_order', { ascending: true })
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
  const { error: machineError } = await supabase.from('gymbro_machines').upsert({
    id: machine.id,
    name: machine.name,
    note: machine.note,
  });

  if (machineError) {
    throw machineError;
  }

  const { error: deleteMuscleGroupsError } = await supabase
    .from('gymbro_machine_muscle_groups')
    .delete()
    .eq('machine_id', machine.id);

  if (deleteMuscleGroupsError) {
    throw deleteMuscleGroupsError;
  }

  if (machine.muscleGroups.length === 0) {
    return;
  }

  const { error: insertMuscleGroupsError } = await supabase
    .from('gymbro_machine_muscle_groups')
    .insert(
      machine.muscleGroups.map((muscleGroup) => ({
        machine_id: machine.id,
        muscle_group: muscleGroup,
      })),
    );

  if (insertMuscleGroupsError) {
    throw insertMuscleGroupsError;
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
