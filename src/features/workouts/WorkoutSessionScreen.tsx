import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  BackHandler,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showAppAlert } from '../../appAlert';
import { EmptyState } from '../../components/EmptyState';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine, Workout, WorkoutExercise, WorkoutSet } from '../../types';

type WorkoutSessionScreenProps = {
  backgroundColor: string;
  isNewWorkout: boolean;
  machines: Machine[];
  onBack: () => void;
  onSave: (workout: Workout) => void;
  workout: Workout;
};

export function WorkoutSessionScreen({
  backgroundColor,
  isNewWorkout,
  machines,
  onBack,
  onSave,
  workout,
}: WorkoutSessionScreenProps) {
  const [draftWorkout, setDraftWorkout] = useState<Workout>(workout);
  const [machineSearchText, setMachineSearchText] = useState('');
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<string[]>([]);
  const [visibleSetNoteIds, setVisibleSetNoteIds] = useState<string[]>([]);
  const filteredMachines = filterMachines(machines, machineSearchText);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExitWorkout();
      return true;
    });

    return () => subscription.remove();
  }, [draftWorkout]);

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
    setCollapsedExerciseIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== exerciseId),
    );
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
    setVisibleSetNoteIds((currentIds) =>
      currentIds.filter((currentId) => currentId !== setId),
    );
  }

  function toggleSetNote(setId: string) {
    setVisibleSetNoteIds((currentIds) =>
      currentIds.includes(setId)
        ? currentIds.filter((currentId) => currentId !== setId)
        : [...currentIds, setId],
    );
  }

  function toggleExerciseCollapse(exerciseId: string) {
    setCollapsedExerciseIds((currentIds) =>
      currentIds.includes(exerciseId)
        ? currentIds.filter((currentId) => currentId !== exerciseId)
        : [...currentIds, exerciseId],
    );
  }

  function saveWorkout() {
    onSave(normalizeWorkoutForSave(draftWorkout));
  }

  function confirmExitWorkout() {
    if (!isNewWorkout && !hasWorkoutChanged(workout, draftWorkout)) {
      onBack();
      return;
    }

    showAppAlert(
      strings.alerts.exitWorkoutTitle,
      strings.alerts.exitWorkoutMessage,
      [
        {
          text: strings.actions.cancel,
          style: 'cancel',
        },
        {
          text: strings.actions.dontSave,
          style: 'destructive',
          onPress: onBack,
        },
        {
          text: strings.actions.save,
          onPress: saveWorkout,
        },
      ],
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <View style={styles.content}>
        <View style={styles.secondaryHeader}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={confirmExitWorkout}
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
                <FlatList
                  columnWrapperStyle={styles.machinePickerRow}
                  contentContainerStyle={styles.machinePickerContent}
                  data={filteredMachines}
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(machine) => machine.id}
                  nestedScrollEnabled
                  numColumns={2}
                  renderItem={({ item: machine }) => (
                    <MachinePickerButton
                      machine={machine}
                      onPress={() => addExercise(machine)}
                      workout={draftWorkout}
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                  style={styles.machinePicker}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.exercisesBlock}>
          <Text style={styles.blockTitle}>{strings.workouts.exercisesTitle}</Text>
          <FlatList
            contentContainerStyle={styles.exercisesListContent}
            data={draftWorkout.exercises}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(exercise) => exercise.id}
            ListEmptyComponent={
              <Text style={styles.helperText}>{strings.workouts.emptyExercises}</Text>
            }
            renderItem={({ item: exercise }) => (
              <WorkoutExerciseCard
                addSet={addSet}
                collapsedExerciseIds={collapsedExerciseIds}
                deleteExercise={deleteExercise}
                deleteSet={deleteSet}
                exercise={exercise}
                toggleExerciseCollapse={toggleExerciseCollapse}
                toggleSetNote={toggleSetNote}
                updateSet={updateSet}
                visibleSetNoteIds={visibleSetNoteIds}
              />
            )}
            style={styles.exercisesList}
          />
        </View>

        <Pressable
          accessibilityLabel={strings.accessibility.finishWorkout}
          onPress={saveWorkout}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.saveButtonText}>{strings.actions.finish}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function WorkoutExerciseCard({
  addSet,
  collapsedExerciseIds,
  deleteExercise,
  deleteSet,
  exercise,
  toggleExerciseCollapse,
  toggleSetNote,
  updateSet,
  visibleSetNoteIds,
}: {
  addSet: (exerciseId: string) => void;
  collapsedExerciseIds: string[];
  deleteExercise: (exerciseId: string) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  exercise: WorkoutExercise;
  toggleExerciseCollapse: (exerciseId: string) => void;
  toggleSetNote: (setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string,
  ) => void;
  visibleSetNoteIds: string[];
}) {
  const isCollapsed = collapsedExerciseIds.includes(exercise.id);

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseTitleBlock}>
          <Text style={styles.exerciseTitle}>{exercise.machineName}</Text>
          <Text style={styles.exerciseMeta}>
            {strings.workouts.exerciseMeta(exercise.sets.length)}
          </Text>
        </View>
        <View style={styles.exerciseHeaderActions}>
          <Pressable
            accessibilityLabel={strings.workouts.deleteExercise}
            onPress={() => deleteExercise(exercise.id)}
            style={({ pressed }) => [
              styles.smallIconButton,
              styles.smallDeleteButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.smallDeleteButtonText}>
              {strings.actions.deleteIcon}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel={
              isCollapsed
                ? strings.workouts.expandExercise
                : strings.workouts.collapseExercise
            }
            onPress={() => toggleExerciseCollapse(exercise.id)}
            style={({ pressed }) => [
              styles.smallIconButton,
              styles.collapseButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              color={colors.text}
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
            />
          </Pressable>
        </View>
      </View>

      {isCollapsed ? null : (
        <>
          {exercise.sets.map((workoutSet, index) => (
            <View key={workoutSet.id} style={styles.setBlock}>
              <View style={styles.setRow}>
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
                  accessibilityLabel={strings.workouts.toggleSetNote}
                  onPress={() => toggleSetNote(workoutSet.id)}
                  style={({ pressed }) => [
                    styles.smallIconButton,
                    styles.smallNoteButton,
                    (visibleSetNoteIds.includes(workoutSet.id) ||
                      workoutSet.note.length > 0) &&
                      styles.activeSmallNoteButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Ionicons
                    color={
                      visibleSetNoteIds.includes(workoutSet.id) ||
                      workoutSet.note.length > 0
                        ? '#6D28D9'
                        : colors.text
                    }
                    name="document-text-outline"
                    size={18}
                  />
                </Pressable>
                <Pressable
                  accessibilityLabel={strings.workouts.deleteSet}
                  onPress={() => deleteSet(exercise.id, workoutSet.id)}
                  style={({ pressed }) => [
                    styles.smallIconButton,
                    styles.smallDeleteButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.smallDeleteButtonText}>
                    {strings.actions.deleteIcon}
                  </Text>
                </Pressable>
              </View>
              {visibleSetNoteIds.includes(workoutSet.id) ||
              workoutSet.note.length > 0 ? (
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
              ) : null}
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
        </>
      )}
    </View>
  );
}

function MachinePickerButton({
  machine,
  onPress,
  workout,
}: {
  machine: Machine;
  onPress: () => void;
  workout: Workout;
}) {
  const matchingExercises = workout.exercises.filter(
    (exercise) => exercise.machineId === machine.id,
  );
  const setCount = matchingExercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  );
  const isSelected = matchingExercises.length > 0;

  return (
    <Pressable
      accessibilityLabel={strings.workouts.addMachineToWorkout(machine.name)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.machineButton,
        isSelected && styles.selectedMachineButton,
        pressed && styles.pressedButton,
      ]}
    >
      <Text
        style={[
          styles.machineButtonText,
          isSelected && styles.selectedMachineButtonText,
        ]}
      >
        {machine.name}
      </Text>
      {isSelected ? (
        <Text style={styles.machineButtonMeta}>
          {strings.workouts.machineAlreadyAdded(matchingExercises.length, setCount)}
        </Text>
      ) : null}
    </Pressable>
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
      ...machine.muscleGroups.map(
        (muscleGroup) => strings.muscleGroups.labels[muscleGroup],
      ),
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

function normalizeWorkoutForSave(workout: Workout): Workout {
  return {
    ...workout,
    name: workout.name.trim() || strings.workouts.defaultName,
  };
}

function hasWorkoutChanged(initialWorkout: Workout, draftWorkout: Workout) {
  return (
    JSON.stringify(normalizeWorkoutForSave(initialWorkout)) !==
    JSON.stringify(normalizeWorkoutForSave(draftWorkout))
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
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
    gap: 4,
    marginBottom: 8,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  block: {
    marginBottom: 8,
  },
  exercisesBlock: {
    flex: 1,
    marginBottom: 0,
  },
  exercisesList: {
    flex: 1,
  },
  exercisesListContent: {
    flexGrow: 1,
    paddingBottom: 76,
  },
  blockTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  machinePicker: {
    flexGrow: 0,
    maxHeight: 118,
  },
  machinePickerContent: {
    gap: 6,
    paddingBottom: 2,
  },
  machinePickerRow: {
    gap: 8,
  },
  machineSearchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  machineSearchInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 15,
    height: 40,
    paddingHorizontal: 12,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  machineButton: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectedMachineButton: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.primary,
  },
  machineButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedMachineButtonText: {
    color: '#166534',
  },
  machineButtonMeta: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
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
    marginBottom: 8,
    padding: 8,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  exerciseTitleBlock: {
    flex: 1,
  },
  exerciseHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  exerciseTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  exerciseMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  setRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  setBlock: {
    gap: 6,
    marginBottom: 7,
  },
  setNumber: {
    backgroundColor: '#F3F4F6',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
    height: 38,
    lineHeight: 36,
    overflow: 'hidden',
    textAlign: 'center',
    width: 32,
  },
  smallInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    height: 38,
    includeFontPadding: false,
    paddingHorizontal: 6,
    paddingBottom: 0,
    paddingTop: 2,
    textAlignVertical: 'center',
    width: 78,
  },
  setNoteInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 34,
    paddingHorizontal: 8,
  },
  smallIconButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  collapseButton: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
  },
  smallNoteButton: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
  },
  activeSmallNoteButton: {
    backgroundColor: '#EDE9FE',
    borderColor: '#6D28D9',
  },
  smallDeleteButton: {
    backgroundColor: colors.panel,
    borderColor: colors.destructiveBorder,
  },
  smallDeleteButtonText: {
    color: colors.destructive,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    bottom: 20,
    justifyContent: 'center',
    left: 20,
    minHeight: 48,
    position: 'absolute',
    right: 20,
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
