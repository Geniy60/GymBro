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
import { createId } from '../../createId';
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
import type {
  Machine,
  MuscleGroup,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '../../types';
import { EmptyWorkoutExerciseList } from './EmptyWorkoutExerciseList';
import { MachinePickerScreen } from './MachinePickerScreen';
import { MachineSuggestScreen } from './MachineSuggestScreen';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';
import {
  type SaveStatus,
  WorkoutSessionFooter,
} from './WorkoutSessionFooter';
import {
  addSetToExercise,
  createEmptySets,
  createSetsFromHistory,
  filterMachines,
  hasWorkoutChanged,
  normalizeWorkoutForSave,
  pickSuggestedMachines,
  shouldConfirmExitWorkout,
} from './workoutSessionModel';

type WorkoutSessionScreenProps = {
  backgroundColor: string;
  isNewWorkout: boolean;
  machines: Machine[];
  onBack: () => void;
  onSave: (
    workout: Workout,
    options: { closeAfterSave: boolean },
  ) => Promise<boolean>;
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
  const [savedWorkout, setSavedWorkout] = useState<Workout>(workout);
  const [isSavedWorkoutNew, setIsSavedWorkoutNew] = useState(isNewWorkout);
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
  }, [
    draftWorkout,
    isMachinePickerOpen,
    isMachineSuggestOpen,
    isSavedWorkoutNew,
    savedWorkout,
  ]);

  useEffect(() => {
    if (previousMaxesQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [previousMaxesQuery.isError]);

  useEffect(() => {
    const shouldStoreDraft = shouldConfirmExitWorkout(
      isSavedWorkoutNew,
      savedWorkout,
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
  }, [draftWorkout, isSavedWorkoutNew, savedWorkout, userId]);

  useEffect(() => {
    if (saveStatus === 'saved' && hasWorkoutChanged(savedWorkout, draftWorkout)) {
      setSaveStatus('idle');
    }
  }, [draftWorkout, savedWorkout, saveStatus]);

  useEffect(() => {
    if (saveStatus !== 'saved') {
      return undefined;
    }

    const timeoutId = setTimeout(() => setSaveStatus('idle'), 1800);

    return () => clearTimeout(timeoutId);
  }, [saveStatus]);

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

  async function saveWorkout(closeAfterSave: boolean) {
    if (saveStatus === 'saving') {
      return;
    }

    const normalizedWorkout = normalizeWorkoutForSave(draftWorkout);
    setSaveStatus('saving');

    const didSave = await onSave(normalizedWorkout, { closeAfterSave });

    if (didSave) {
      setDraftWorkout(normalizedWorkout);
      setSavedWorkout(normalizedWorkout);
      setIsSavedWorkoutNew(false);
      await clearWorkoutDraft(normalizedWorkout.id);
      if (!closeAfterSave) {
        setSaveStatus('saved');
      }
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
    if (!shouldConfirmExitWorkout(isSavedWorkoutNew, savedWorkout, draftWorkout)) {
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
            void saveWorkout(true);
          },
        },
      ],
    );
  }

  if (isMachinePickerOpen) {
    return (
      <MachinePickerScreen
        backgroundColor={backgroundColor}
        filteredMachines={filteredMachines}
        machineSearchText={machineSearchText}
        machines={machines}
        onAddExercise={(machine) => {
          void addExercise(machine);
        }}
        onBack={closeMachinePicker}
        onChangeSearchText={setMachineSearchText}
        workout={draftWorkout}
      />
    );
  }

  if (isMachineSuggestOpen) {
    return (
      <MachineSuggestScreen
        backgroundColor={backgroundColor}
        hasSuggestAttempt={hasSuggestAttempt}
        onAddSuggestedMachines={() => {
          void addSuggestedMachinesToWorkout();
        }}
        onBack={closeMachineSuggest}
        onChangeSuggestMachineCount={changeSuggestMachineCount}
        onSuggestMachines={suggestMachines}
        onToggleSuggestMuscleGroup={toggleSuggestMuscleGroup}
        selectedSuggestMuscleGroups={selectedSuggestMuscleGroups}
        suggestMachineCount={suggestMachineCount}
        suggestedMachines={suggestedMachines}
      />
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

        <WorkoutSessionFooter
          onFinish={() => {
            void saveWorkout(true);
          }}
          onSave={() => {
            void saveWorkout(false);
          }}
          saveStatus={saveStatus}
        />
      </View>
    </SafeAreaView>
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
  pressedButton: {
    opacity: 0.7,
  },
});
