import { MachineTile } from '../../components/MachineTile';
import { strings } from '../../strings';
import type { Machine, Workout } from '../../types';

type MachinePickerButtonProps = {
  machine: Machine;
  onPress: () => void;
  workout: Workout;
};

export function MachinePickerButton({
  machine,
  onPress,
  workout,
}: MachinePickerButtonProps) {
  const matchingExercises = workout.exercises.filter(
    (exercise) => exercise.machineId === machine.id,
  );
  const isSelected = matchingExercises.length > 0;

  return (
    <MachineTile
      accessibilityLabel={strings.workouts.addMachineToWorkout(machine.name)}
      machine={machine}
      onPress={onPress}
      selected={isSelected}
    />
  );
}
