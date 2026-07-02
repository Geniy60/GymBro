import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BackHandler,
  FlatList,
  Pressable,
  ScrollView,
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
import {
  clearWorkoutDraft,
  saveWorkoutDraft,
} from '../../storage/workoutDraftStorage';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import { muscleGroups } from '../../muscleGroups';
import type {
  Machine,
  MuscleGroup,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '../../types';
import { EmptyWorkoutExerciseList } from './EmptyWorkoutExerciseList';
import { MachinePickerButton } from './MachinePickerButton';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';

type WorkoutSessionScreenProps = {
  backgroundColor: string;
  isNewWorkout: boolean;
  machines: Machine[];
  onBack: () => void;
  onSave: (workout: Workout) => Promise<boolean>;
  userId: string;
  workout: Workout;
};

type SaveStatus = 'idle' | 'saving' | 'error';

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
  const [isMachineSuggestOpen, setIsMachineSuggestOpen] = useState(false);
  const [selectedSuggestMuscleGroups, setSelectedSuggestMuscleGroups] = useState<
    MuscleGroup[]
  >([]);
  const [suggestMachineCount, setSuggestMachineCount] = useState(4);
  const [suggestedMachines, setSuggestedMachines] = useState<Machine[]>([]);
  const [hasSuggestAttempt, setHasSuggestAttempt] = useState(false);
  const [collapsedExerciseIds, setCollapsedExerciseIds] = useState<string[]>([]);
  const [visibleSetNoteIds, setVisibleSetNoteIds] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
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
      if (isMachineSuggestOpen) {
        closeMachineSuggest();
        return true;
      }

      if (isMachinePickerOpen) {
        closeMachinePicker();
        return true;
      }

      confirmExitWorkout();
      return true;
    });

    return () => subscription.remove();
  }, [draftWorkout, isMachinePickerOpen, isMachineSuggestOpen]);

  useEffect(() => {
    if (previousMaxesQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [previousMaxesQuery.isError]);

  useEffect(() => {
    const shouldStoreDraft = shouldConfirmExitWorkout(
      isNewWorkout,
      workout,
      draftWorkout,
    );
    const timeoutId = setTimeout(() => {
      if (shouldStoreDraft) {
        void saveWorkoutDraft({
          isNewWorkout,
          savedAt: new Date().toISOString(),
          userId,
          workout: draftWorkout,
        });
        return;
      }

      void clearWorkoutDraft(draftWorkout.id);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [draftWorkout, isNewWorkout, userId, workout]);

  function updateWorkoutName(name: string) {
    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      name,
    }));
  }

  async function createExerciseForMachine(machine: Machine): Promise<WorkoutExercise> {
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

    return {
      id: createId(),
      machineId: machine.id,
      machineName: machine.name,
      sets: createSetsFromHistory(historySets),
    };
  }

  async function addExercise(machine: Machine) {
    const exercise = await createExerciseForMachine(machine);

    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, exercise],
    }));
    setCollapsedExerciseIds(draftWorkout.exercises.map((currentExercise) => currentExercise.id));
    closeMachinePicker();
  }

  async function addSuggestedMachinesToWorkout() {
    if (suggestedMachines.length === 0) {
      return;
    }

    const exercises = await Promise.all(suggestedMachines.map(createExerciseForMachine));

    setDraftWorkout((currentWorkout) => ({
      ...currentWorkout,
      exercises: [...currentWorkout.exercises, ...exercises],
    }));
    setCollapsedExerciseIds(draftWorkout.exercises.map((currentExercise) => currentExercise.id));
    closeMachineSuggest();
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

  async function saveWorkout() {
    if (saveStatus === 'saving') {
      return;
    }

    const normalizedWorkout = normalizeWorkoutForSave(draftWorkout);
    setSaveStatus('saving');

    const didSave = await onSave(normalizedWorkout);

    if (didSave) {
      await clearWorkoutDraft(normalizedWorkout.id);
      return;
    }

    setSaveStatus('error');
  }

  function openMachinePicker() {
    setIsMachinePickerOpen(true);
  }

  function closeMachinePicker() {
    setIsMachinePickerOpen(false);
  }

  function openMachineSuggest() {
    setIsMachineSuggestOpen(true);
    setSuggestedMachines([]);
    setHasSuggestAttempt(false);
  }

  function closeMachineSuggest() {
    setIsMachineSuggestOpen(false);
  }

  function toggleSuggestMuscleGroup(muscleGroup: MuscleGroup) {
    setSelectedSuggestMuscleGroups((currentMuscleGroups) =>
      currentMuscleGroups.includes(muscleGroup)
        ? currentMuscleGroups.filter(
            (currentMuscleGroup) => currentMuscleGroup !== muscleGroup,
          )
        : [...currentMuscleGroups, muscleGroup],
    );
    setSuggestedMachines([]);
    setHasSuggestAttempt(false);
  }

  function changeSuggestMachineCount(count: number) {
    setSuggestMachineCount(count);
    setSuggestedMachines([]);
    setHasSuggestAttempt(false);
  }

  function suggestMachines() {
    setHasSuggestAttempt(true);
    setSuggestedMachines(
      pickSuggestedMachines({
        count: suggestMachineCount,
        machines,
        selectedMuscleGroups: selectedSuggestMuscleGroups,
        workout: draftWorkout,
      }),
    );
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
          onPress: () => {
            void clearWorkoutDraft(draftWorkout.id);
            onBack();
          },
        },
        {
          text: strings.actions.save,
          onPress: () => {
            void saveWorkout();
          },
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

  if (isMachineSuggestOpen) {
    const canSuggest = selectedSuggestMuscleGroups.length > 0;

    return (
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={[styles.safeArea, { backgroundColor }]}
      >
        <View style={styles.content}>
          <View style={styles.secondaryHeader}>
            <Pressable
              accessibilityLabel={strings.accessibility.back}
              onPress={closeMachineSuggest}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Text style={styles.secondaryTitle}>
              {strings.workouts.suggestMachinesTitle}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.suggestContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.suggestSectionTitle}>
              {strings.workouts.suggestMuscleGroupsTitle}
            </Text>
            <View style={styles.suggestChipGrid}>
              {muscleGroups.map((muscleGroup) => {
                const isSelected = selectedSuggestMuscleGroups.includes(muscleGroup);

                return (
                  <Pressable
                    accessibilityLabel={strings.workouts.toggleSuggestMuscleGroup(
                      strings.muscleGroups.labels[muscleGroup],
                    )}
                    key={muscleGroup}
                    onPress={() => toggleSuggestMuscleGroup(muscleGroup)}
                    style={({ pressed }) => [
                      styles.suggestChip,
                      isSelected && styles.selectedSuggestChip,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.suggestChipText,
                        isSelected && styles.selectedSuggestChipText,
                      ]}
                    >
                      {strings.muscleGroups.labels[muscleGroup]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.suggestSectionTitle}>
              {strings.workouts.suggestCountTitle}
            </Text>
            <View style={styles.suggestCountRow}>
              {[3, 4, 5, 6].map((count) => {
                const isSelected = suggestMachineCount === count;

                return (
                  <Pressable
                    accessibilityLabel={strings.workouts.selectSuggestMachineCount(count)}
                    key={count}
                    onPress={() => changeSuggestMachineCount(count)}
                    style={({ pressed }) => [
                      styles.countButton,
                      isSelected && styles.selectedCountButton,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.countButtonText,
                        isSelected && styles.selectedCountButtonText,
                      ]}
                    >
                      {count}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityLabel={
                hasSuggestAttempt
                  ? strings.workouts.resuggestMachines
                  : strings.workouts.suggestMachinesButton
              }
              disabled={!canSuggest}
              onPress={suggestMachines}
              style={({ pressed }) => [
                styles.suggestPrimaryButton,
                !canSuggest && styles.disabledButton,
                pressed && styles.pressedButton,
              ]}
            >
              <LinearGradient
                colors={['#7C3AED', '#A855F7', '#EC4899']}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={styles.suggestPrimaryGradient}
              >
                <Ionicons name="sparkles-outline" size={20} color={colors.panel} />
                <Text style={styles.suggestPrimaryButtonText}>
                  {hasSuggestAttempt
                    ? strings.workouts.resuggestMachines
                    : strings.workouts.suggestMachinesButton}
                </Text>
              </LinearGradient>
            </Pressable>

            {suggestedMachines.length === 0 ? (
              <Text style={styles.helperText}>
                {getSuggestEmptyMessage({ canSuggest, hasSuggestAttempt })}
              </Text>
            ) : (
              <View style={styles.suggestPreviewBlock}>
                <Text style={styles.suggestSectionTitle}>
                  {strings.workouts.suggestPreviewTitle}
                </Text>
                <View style={styles.suggestPreviewGrid}>
                  {suggestedMachines.map((machine) => (
                    <View key={machine.id} style={styles.suggestPreviewItem}>
                      <MachineTile
                        accessibilityLabel={strings.workouts.suggestedMachine(machine.name)}
                        machine={machine}
                        onPress={noop}
                      />
                    </View>
                  ))}
                  {suggestedMachines.length % 2 === 1 ? (
                    <View style={styles.suggestPreviewItem} />
                  ) : null}
                </View>
                <Pressable
                  accessibilityLabel={strings.workouts.addSuggestedMachines}
                  onPress={() => {
                    void addSuggestedMachinesToWorkout();
                  }}
                  style={({ pressed }) => [
                    styles.suggestAddButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.suggestAddButtonText}>
                    {strings.workouts.addSuggestedMachines}
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
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
              <EmptyWorkoutExerciseList onSuggestMachines={openMachineSuggest} />
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

        {saveStatus !== 'idle' ? (
          <Text
            accessibilityRole={saveStatus === 'error' ? 'alert' : undefined}
            style={[
              styles.saveStatusText,
              saveStatus === 'error' && styles.saveErrorText,
            ]}
          >
            {saveStatus === 'saving'
              ? strings.workouts.saving
              : strings.workouts.saveFailed}
          </Text>
        ) : null}

        <Pressable
          accessibilityLabel={strings.accessibility.finishWorkout}
          disabled={saveStatus === 'saving'}
          onPress={() => {
            void saveWorkout();
          }}
          style={({ pressed }) => [
            styles.saveButton,
            saveStatus === 'saving' && styles.disabledButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.saveButtonText}>
            {saveStatus === 'error' ? strings.actions.retry : strings.actions.finish}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function noop() {}

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

function pickSuggestedMachines({
  count,
  machines,
  selectedMuscleGroups,
  workout,
}: {
  count: number;
  machines: Machine[];
  selectedMuscleGroups: MuscleGroup[];
  workout: Workout;
}): Machine[] {
  const workoutMachineIds = new Set(
    workout.exercises.map((exercise) => exercise.machineId),
  );
  const candidates = machines.filter(
    (machine) =>
      !workoutMachineIds.has(machine.id) &&
      machine.muscleGroups.some((muscleGroup) =>
        selectedMuscleGroups.includes(muscleGroup),
      ),
  );

  return shuffleMachines(candidates).slice(0, count);
}

function getSuggestEmptyMessage({
  canSuggest,
  hasSuggestAttempt,
}: {
  canSuggest: boolean;
  hasSuggestAttempt: boolean;
}): string {
  if (!canSuggest) {
    return strings.workouts.suggestPickMusclesHint;
  }

  if (hasSuggestAttempt) {
    return strings.workouts.suggestNoMatches;
  }

  return strings.workouts.suggestPreviewEmpty;
}

function shuffleMachines(machines: Machine[]): Machine[] {
  return machines
    .map((machine) => ({ machine, sortKey: Math.random() }))
    .sort((left, right) => left.sortKey - right.sortKey)
    .map(({ machine }) => machine);
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
  suggestContent: {
    gap: 14,
    paddingBottom: 28,
  },
  suggestSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  suggestChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestChip: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selectedSuggestChip: {
    backgroundColor: '#EAF7EF',
    borderColor: colors.primary,
  },
  suggestChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedSuggestChipText: {
    color: colors.primary,
  },
  suggestCountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 50,
  },
  selectedCountButton: {
    backgroundColor: '#EAF7EF',
    borderColor: colors.primary,
  },
  countButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  selectedCountButtonText: {
    color: colors.primary,
  },
  suggestPrimaryButton: {
    borderRadius: 8,
    minHeight: 48,
    overflow: 'hidden',
  },
  suggestPrimaryGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  suggestPrimaryButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
  },
  suggestPreviewBlock: {
    gap: 8,
  },
  suggestPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestPreviewItem: {
    flexBasis: '48.5%',
    flexGrow: 1,
    maxWidth: '48.5%',
  },
  suggestAddButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
  },
  suggestAddButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '800',
  },
  saveStatusText: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    bottom: 68,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    left: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    right: 20,
    textAlign: 'center',
  },
  saveErrorText: {
    borderColor: colors.destructiveBorder,
    color: colors.destructive,
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
