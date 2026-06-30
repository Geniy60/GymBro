import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { MachineTile } from '../../components/MachineTile';
import { SearchInput } from '../../components/SearchInput';
import { queryKeys } from '../../queryClient';
import {
  loadLatestSetsForMachine,
  loadPreviousMaxesForMachines,
} from '../../services/workoutsService';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine, Workout, WorkoutExercise, WorkoutSet } from '../../types';

type WorkoutSessionScreenProps = {
  backgroundColor: string;
  isNewWorkout: boolean;
  machines: Machine[];
  onBack: () => void;
  onSave: (workout: Workout) => void;
  userId: string;
  workout: Workout;
};

export function WorkoutSessionScreen({
  backgroundColor,
  isNewWorkout,
  machines,
  onBack,
  onSave,
  userId,
  workout,
}: WorkoutSessionScreenProps) {
  const [draftWorkout, setDraftWorkout] = useState<Workout>(workout);
  const [machineSearchText, setMachineSearchText] = useState('');
  const [isMachinePickerOpen, setIsMachinePickerOpen] = useState(false);
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<string[]>([]);
  const [visibleSetNoteIds, setVisibleSetNoteIds] = useState<string[]>([]);
  const filteredMachines = filterMachines(machines, machineSearchText);
  const machineIds = useMemo(
    () => [...new Set(draftWorkout.exercises.map((exercise) => exercise.machineId))],
    [draftWorkout.exercises],
  );
  const previousMaxesQuery = useQuery({
    enabled: machineIds.length > 0,
    queryFn: () =>
      loadPreviousMaxesForMachines({
        currentWorkoutId: workout.id,
        machineIds,
        userId,
      }),
    queryKey: queryKeys.previousMachineMaxes(
      userId,
      workout.id,
      machineIds.slice().sort().join('|'),
    ),
  });

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

  useEffect(() => {
    if (previousMaxesQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [previousMaxesQuery.isError]);

  function updateWorkoutName(name: string) {
    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      name,
    }));
  }

  async function addExercise(machine: Machine) {
    let historySets: WorkoutSet[] = [];

    try {
      historySets = await loadLatestSetsForMachine({
        currentWorkoutId: workout.id,
        machineId: machine.id,
        userId,
      });
    } catch {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }

    const exercise: WorkoutExercise = {
      id: createId(),
      machineId: machine.id,
      machineName: machine.name,
      sets: createSetsFromHistory(historySets),
    };

    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, exercise],
    }));
    setCollapsedExerciseIds(draftWorkout.exercises.map((currentExercise) => currentExercise.id));
    closeMachinePicker();
  }

  function confirmDeleteExercise(exerciseId: string) {
    showAppAlert(
      strings.alerts.deleteExerciseTitle,
      strings.alerts.deleteExerciseMessage,
      [
        {
          text: strings.actions.cancel,
          style: 'cancel',
        },
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => deleteExercise(exerciseId),
        },
      ],
    );
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
    if (!shouldConfirmExitWorkout(isNewWorkout, workout, draftWorkout)) {
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
                <SearchInput
                  onChangeText={setMachineSearchText}
                  placeholder={strings.workouts.machineSearchPlaceholder}
                  value={machineSearchText}
                />
              </View>

              {filteredMachines.length === 0 ? (
                <Text style={styles.helperText}>{strings.empty.filtered.title}</Text>
              ) : (
                <FlatList
                  contentContainerStyle={styles.machinePickerListContent}
                  data={filteredMachines}
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(machine) => machine.id}
                  columnWrapperStyle={styles.machinePickerRow}
                  numColumns={2}
                  renderItem={({ item: machine }) => (
                    <View style={styles.machinePickerItem}>
                      <MachinePickerButton
                        machine={machine}
                        onPress={() => {
                          void addExercise(machine);
                        }}
                        workout={draftWorkout}
                      />
                    </View>
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
                deleteExercise={confirmDeleteExercise}
                deleteSet={deleteSet}
                exercise={exercise}
                previousMaxWeightKg={previousMaxesQuery.data?.get(exercise.machineId)}
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
  previousMaxWeightKg,
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
  previousMaxWeightKg: number | undefined;
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
                <Ionicons
                  color={colors.destructive}
                  name="trash-outline"
                  size={18}
                />
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
          {exercise.sets.map((workoutSet, index) => {
            const isRecord = isRecordSet(workoutSet, previousMaxWeightKg);

            return (
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
                  <View style={styles.setActions}>
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
                      <Ionicons
                        color={colors.destructive}
                        name="trash-outline"
                        size={18}
                      />
                    </Pressable>
                    <View
                      accessibilityLabel={strings.workouts.recordBadge}
                      accessible={isRecord}
                      style={[
                        styles.recordBadge,
                        !isRecord && styles.hiddenRecordBadge,
                      ]}
                    >
                      {isRecord ? (
                        <Ionicons name="trophy-outline" size={17} color="#92400E" />
                      ) : null}
                    </View>
                  </View>
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
            );
          })}

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

function isRecordSet(
  workoutSet: WorkoutSet,
  previousMaxWeightKg: number | undefined,
): boolean {
  if (previousMaxWeightKg === undefined) {
    return false;
  }

  const weightKg = parseWeightKg(workoutSet.weightKg);

  return weightKg !== null && weightKg > previousMaxWeightKg;
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

function parseWeightKg(weightKg: string): number | null {
  const normalizedWeightKg = weightKg.trim().replace(',', '.');

  if (normalizedWeightKg.length === 0) {
    return null;
  }

  const parsedWeightKg = Number(normalizedWeightKg);

  return Number.isFinite(parsedWeightKg) ? parsedWeightKg : null;
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

function shouldConfirmExitWorkout(
  isNewWorkout: boolean,
  initialWorkout: Workout,
  draftWorkout: Workout,
) {
  if (isNewWorkout) {
    return draftWorkout.exercises.length > 0;
  }

  return hasWorkoutChanged(initialWorkout, draftWorkout);
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
    gap: 10,
    paddingBottom: 24,
  },
  machinePickerRow: {
    gap: 10,
  },
  machinePickerItem: {
    flex: 1,
    maxWidth: '48.5%',
  },
  machineSearchRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
    marginBottom: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  collapsedExerciseCard: {
    backgroundColor: '#FCFDFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  collapsedExerciseHeader: {
    marginBottom: 0,
    minHeight: 40,
  },
  exerciseTitleBlock: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  exerciseHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  exerciseTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  setRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
  },
  setActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginLeft: 'auto',
  },
  setBlock: {
    gap: 7,
    marginBottom: 8,
  },
  setNumber: {
    backgroundColor: '#EEF2F7',
    borderColor: '#D9E0EA',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    height: 38,
    lineHeight: 36,
    overflow: 'hidden',
    textAlign: 'center',
    width: 32,
  },
  smallInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
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
    width: 74,
  },
  setNoteInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 34,
    paddingHorizontal: 8,
  },
  recordBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF7D6',
    borderColor: '#F59E0B',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 38,
  },
  hiddenRecordBadge: {
    opacity: 0,
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
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  smallNoteButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  activeSmallNoteButton: {
    backgroundColor: '#EDE9FE',
    borderColor: '#6D28D9',
  },
  smallClearButton: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.primary,
  },
  smallDeleteButton: {
    backgroundColor: '#FFF7F7',
    borderColor: colors.destructiveBorder,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#86CFA8',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
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
