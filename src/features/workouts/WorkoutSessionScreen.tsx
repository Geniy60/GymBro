import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../../components/EmptyState';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine, Workout, WorkoutExercise, WorkoutSet } from '../../types';

type WorkoutSessionScreenProps = {
  machines: Machine[];
  onBack: () => void;
  onSave: (workout: Workout) => void;
  workout: Workout;
};

export function WorkoutSessionScreen({
  machines,
  onBack,
  onSave,
  workout,
}: WorkoutSessionScreenProps) {
  const [draftWorkout, setDraftWorkout] = useState<Workout>(workout);
  const [machineSearchText, setMachineSearchText] = useState('');
  const filteredMachines = filterMachines(machines, machineSearchText);

  function updateWorkoutName(name: string) {
    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      name,
    }));
  }

  function addExercise(machine: Machine) {
    const exercise: WorkoutExercise = {
      id: createId(),
      machineId: machine.id,
      machineName: machine.name,
      sets: [createEmptySet()],
    };

    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, exercise],
    }));
  }

  function deleteExercise(exerciseId: string) {
    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: currentWorkout.exercises.filter(
        (exercise) => exercise.id !== exerciseId,
      ),
    }));
  }

  function addSet(exerciseId: string) {
    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map((exercise) =>
        exercise.id === exerciseId ? addSetToExercise(exercise) : exercise,
      ),
    }));
  }

  function updateSet(
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string,
  ) {
    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((workoutSet) =>
                workoutSet.id === setId
                  ? {
                      ...workoutSet,
                      [field]: value,
                    }
                  : workoutSet,
              ),
            }
          : exercise,
      ),
    }));
  }

  function deleteSet(exerciseId: string, setId: string) {
    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.filter((workoutSet) => workoutSet.id !== setId),
            }
          : exercise,
      ),
    }));
  }

  function saveWorkout() {
    const nextWorkout = {
      ...draftWorkout,
      name: draftWorkout.name.trim() || strings.workouts.defaultName,
    };

    onSave(nextWorkout);
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.secondaryHeader}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.secondaryTitle}>{strings.workouts.sessionTitle}</Text>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>{strings.forms.workout.nameLabel}</Text>
          <TextInput
            accessibilityLabel={strings.forms.workout.nameLabel}
            onChangeText={updateWorkoutName}
            placeholder={strings.forms.workout.namePlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draftWorkout.name}
          />
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>{strings.workouts.addExerciseTitle}</Text>
          {machines.length === 0 ? (
            <EmptyState
              message={strings.workouts.noMachinesMessage}
              title={strings.workouts.noMachinesTitle}
            />
          ) : (
            <>
              <View style={styles.machineSearchRow}>
                <TextInput
                  accessibilityLabel={strings.accessibility.searchMachinesInWorkout}
                  onChangeText={setMachineSearchText}
                  placeholder={strings.workouts.machineSearchPlaceholder}
                  placeholderTextColor={colors.muted}
                  style={styles.machineSearchInput}
                  value={machineSearchText}
                />
                {machineSearchText.length > 0 ? (
                  <Pressable
                    accessibilityLabel={strings.accessibility.clearSearch}
                    onPress={() => setMachineSearchText('')}
                    style={({ pressed }) => [
                      styles.clearButton,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Ionicons name="close" size={22} color={colors.text} />
                  </Pressable>
                ) : null}
              </View>

              {filteredMachines.length === 0 ? (
                <Text style={styles.helperText}>{strings.empty.filtered.title}</Text>
              ) : (
                <View style={styles.machinePicker}>
                  {filteredMachines.map((machine) => (
                    <Pressable
                      accessibilityLabel={strings.workouts.addMachineToWorkout(machine.name)}
                      key={machine.id}
                      onPress={() => addExercise(machine)}
                      style={({ pressed }) => [
                        styles.machineButton,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text style={styles.machineButtonText}>{machine.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>{strings.workouts.exercisesTitle}</Text>
          {draftWorkout.exercises.length === 0 ? (
            <Text style={styles.helperText}>{strings.workouts.emptyExercises}</Text>
          ) : (
            draftWorkout.exercises.map((exercise) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseTitle}>{exercise.machineName}</Text>
                  <Pressable
                    accessibilityLabel={strings.workouts.deleteExercise}
                    onPress={() => deleteExercise(exercise.id)}
                    style={({ pressed }) => [
                      styles.smallDeleteButton,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text style={styles.smallDeleteButtonText}>
                      {strings.actions.deleteIcon}
                    </Text>
                  </Pressable>
                </View>

                {exercise.sets.map((workoutSet, index) => (
                  <View key={workoutSet.id} style={styles.setRow}>
                    <Text style={styles.setNumber}>
                      {strings.workouts.setNumber(index + 1)}
                    </Text>
                    <TextInput
                      accessibilityLabel={strings.workouts.weightLabel}
                      keyboardType="decimal-pad"
                      onChangeText={(value) =>
                        updateSet(exercise.id, workoutSet.id, 'weightKg', value)
                      }
                      placeholder={strings.workouts.weightPlaceholder}
                      placeholderTextColor={colors.muted}
                      style={styles.smallInput}
                      value={workoutSet.weightKg}
                    />
                    <TextInput
                      accessibilityLabel={strings.workouts.repsLabel}
                      keyboardType="number-pad"
                      onChangeText={(value) =>
                        updateSet(exercise.id, workoutSet.id, 'reps', value)
                      }
                      placeholder={strings.workouts.repsPlaceholder}
                      placeholderTextColor={colors.muted}
                      style={styles.smallInput}
                      value={workoutSet.reps}
                    />
                    <Pressable
                      accessibilityLabel={strings.workouts.deleteSet}
                      onPress={() => deleteSet(exercise.id, workoutSet.id)}
                      style={({ pressed }) => [
                        styles.smallDeleteButton,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Text style={styles.smallDeleteButtonText}>
                        {strings.actions.deleteIcon}
                      </Text>
                    </Pressable>
                    <TextInput
                      accessibilityLabel={strings.workouts.setNoteLabel}
                      onChangeText={(value) =>
                        updateSet(exercise.id, workoutSet.id, 'note', value)
                      }
                      placeholder={strings.workouts.setNotePlaceholder}
                      placeholderTextColor={colors.muted}
                      style={styles.setNoteInput}
                      value={workoutSet.note}
                    />
                  </View>
                ))}

                <Pressable
                  accessibilityLabel={strings.workouts.addSet}
                  onPress={() => addSet(exercise.id)}
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.secondaryButtonText}>{strings.workouts.addSet}</Text>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <Pressable
          accessibilityLabel={strings.accessibility.saveWorkout}
          onPress={saveWorkout}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.saveButtonText}>{strings.actions.save}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function filterMachines(machines: Machine[], searchText: string) {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();

  if (normalizedSearchText.length === 0) {
    return machines;
  }

  return machines.filter((machine) => {
    const searchableText = [
      machine.name,
      machine.muscleGroup,
      machine.note,
    ].join(' ').toLocaleLowerCase();

    return searchableText.includes(normalizedSearchText);
  });
}

function createEmptySet(): WorkoutSet {
  return {
    id: createId(),
    weightKg: '',
    reps: '',
    note: '',
  };
}

function addSetToExercise(exercise: WorkoutExercise) {
  const previousSet = exercise.sets[exercise.sets.length - 1];
  const workoutSet: WorkoutSet = {
    ...createEmptySet(),
    weightKg: previousSet?.weightKg ?? '',
    reps: previousSet?.reps ?? '',
  };

  return {
    ...exercise,
    sets: [...exercise.sets, workoutSet],
  };
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    width: 37,
  },
  secondaryTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  formField: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  block: {
    marginBottom: 18,
  },
  blockTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  machinePicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  machineSearchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  machineSearchInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    height: 44,
    paddingHorizontal: 14,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  machineButton: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  machineButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  exerciseCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  exerciseTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  setRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  setNumber: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    width: 34,
  },
  smallInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    height: 40,
    paddingHorizontal: 10,
    width: 78,
  },
  setNoteInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flexBasis: '100%',
    fontSize: 15,
    minHeight: 40,
    paddingHorizontal: 10,
  },
  smallDeleteButton: {
    alignItems: 'center',
    borderColor: colors.destructiveBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  smallDeleteButtonText: {
    color: colors.destructive,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
