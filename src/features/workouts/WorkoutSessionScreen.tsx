import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
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
  previousWorkouts: Workout[];
  workout: Workout;
};

export function WorkoutSessionScreen({
  backgroundColor,
  isNewWorkout,
  machines,
  onBack,
  onSave,
  previousWorkouts,
  workout,
}: WorkoutSessionScreenProps) {
  const [draftWorkout, setDraftWorkout] = useState<Workout>(workout);
  const [machineSearchText, setMachineSearchText] = useState('');
  const [isMachinePickerOpen, setIsMachinePickerOpen] = useState(false);
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<string[]>([]);
  const [visibleSetNoteIds, setVisibleSetNoteIds] = useState<string[]>([]);
  const filteredMachines = filterMachines(machines, machineSearchText);
  const lastSetsByMachineId = useMemo(
    () => buildLastSetsByMachineId(previousWorkouts, workout.id),
    [previousWorkouts, workout.id],
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isMachinePickerOpen) {
        closeMachinePicker();
        return true;
      }

      confirmExitWorkout();
      return true;
    });

    return () => subscription.remove();
  }, [draftWorkout, isMachinePickerOpen]);

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
      sets: createSetsFromHistory(lastSetsByMachineId.get(machine.id)),
    };

    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, exercise],
    }));
    setCollapsedExerciseIds(draftWorkout.exercises.map((currentExercise) => currentExercise.id));
    closeMachinePicker();
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

  function clearExerciseSets(exerciseId: string) {
    const exerciseToClear = draftWorkout.exercises.find(
      (exercise) => exercise.id === exerciseId,
    );
    const setCount = exerciseToClear?.sets.length ?? 0;
    const clearedSetIds = exerciseToClear?.sets.map((workoutSet) => workoutSet.id) ?? [];

    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: currentWorkout.exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: createEmptySets(setCount > 0 ? setCount : 4),
            }
          : exercise,
      ),
    }));
    setVisibleSetNoteIds((currentIds) =>
      currentIds.filter((currentId) => !clearedSetIds.includes(currentId)),
    );
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

  function openMachinePicker() {
    setIsMachinePickerOpen(true);
  }

  function closeMachinePicker() {
    setIsMachinePickerOpen(false);
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

  if (isMachinePickerOpen) {
    return (
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={[styles.safeArea, { backgroundColor }]}
      >
        <View style={styles.content}>
          <View style={styles.secondaryHeader}>
            <Pressable
              accessibilityLabel={strings.accessibility.back}
              onPress={closeMachinePicker}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.secondaryTitle}>
              {strings.workouts.addExerciseTitle}
            </Text>
          </View>

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
                  contentContainerStyle={styles.machinePickerListContent}
                  data={filteredMachines}
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(machine) => machine.id}
                  renderItem={({ item: machine }) => (
                    <MachinePickerButton
                      machine={machine}
                      onPress={() => addExercise(machine)}
                      workout={draftWorkout}
                    />
                  )}
                  showsVerticalScrollIndicator={false}
                  style={styles.machinePickerList}
                />
              )}
            </>
          )}
        </View>
      </SafeAreaView>
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

        <View style={styles.workoutTopRow}>
          <TextInput
            accessibilityLabel={strings.forms.workout.nameLabel}
            onChangeText={updateWorkoutName}
            placeholder={strings.forms.workout.namePlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={draftWorkout.name}
          />
          <Pressable
            accessibilityLabel={strings.accessibility.openMachinePicker}
            onPress={openMachinePicker}
            style={({ pressed }) => [
              styles.addMachineIconButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="add" size={26} color={colors.panel} />
          </Pressable>
        </View>

        <View style={styles.exercisesBlock}>
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
                clearExerciseSets={clearExerciseSets}
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
  clearExerciseSets,
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
  clearExerciseSets: (exerciseId: string) => void;
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
    <View style={[styles.exerciseCard, isCollapsed && styles.collapsedExerciseCard]}>
      <View
        style={[
          styles.exerciseHeader,
          isCollapsed && styles.collapsedExerciseHeader,
        ]}
      >
        <View style={styles.exerciseTitleBlock}>
          <Text style={styles.exerciseTitle}>{exercise.machineName}</Text>
          <Text style={styles.exerciseMeta}>
            {strings.workouts.exerciseMeta(exercise.sets.length)}
          </Text>
        </View>
        <View style={styles.exerciseHeaderActions}>
          {isCollapsed ? null : (
            <>
              <Pressable
                accessibilityLabel={strings.workouts.clearExerciseSets}
                onPress={() => clearExerciseSets(exercise.id)}
                style={({ pressed }) => [
                  styles.smallIconButton,
                  styles.smallClearButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons color={colors.primary} name="refresh" size={18} />
              </Pressable>
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
            </>
          )}
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

function buildLastSetsByMachineId(
  workouts: Workout[],
  currentWorkoutId: string,
): Map<string, WorkoutSet[]> {
  const lastSetsByMachineId = new Map<string, WorkoutSet[]>();
  const sortedWorkouts = [...workouts].sort(
    (firstWorkout, secondWorkout) =>
      new Date(secondWorkout.startedAt).getTime() -
      new Date(firstWorkout.startedAt).getTime(),
  );

  for (const workoutItem of sortedWorkouts) {
    if (workoutItem.id === currentWorkoutId) {
      continue;
    }

    for (const exercise of workoutItem.exercises) {
      if (
        exercise.machineId.length === 0 ||
        exercise.sets.length === 0 ||
        lastSetsByMachineId.has(exercise.machineId)
      ) {
        continue;
      }

      lastSetsByMachineId.set(exercise.machineId, exercise.sets);
    }
  }

  return lastSetsByMachineId;
}

function createSetsFromHistory(historySets: WorkoutSet[] | undefined): WorkoutSet[] {
  if (historySets === undefined || historySets.length === 0) {
    return createEmptySets(4);
  }

  return historySets.map((historySet) => ({
    ...historySet,
    id: createId(),
  }));
}

function createEmptySet(): WorkoutSet {
  return {
    id: createId(),
    weightKg: '',
    reps: '',
    note: '',
  };
}

function createEmptySets(count: number): WorkoutSet[] {
  return Array.from({ length: count }, createEmptySet);
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
  workoutTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 15,
    height: 44,
    paddingHorizontal: 12,
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
    paddingBottom: 68,
  },
  addMachineIconButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  machinePickerList: {
    flex: 1,
  },
  machinePickerListContent: {
    gap: 8,
    paddingBottom: 24,
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
    alignSelf: 'stretch',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  collapsedExerciseCard: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  collapsedExerciseHeader: {
    marginBottom: 0,
    minHeight: 38,
  },
  exerciseTitleBlock: {
    justifyContent: 'center',
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
  smallClearButton: {
    backgroundColor: colors.panel,
    borderColor: colors.primary,
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
    bottom: 12,
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
