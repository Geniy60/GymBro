import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { showAppAlert } from '../../appAlert';
import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { createId } from '../../createId';
import { queryKeys } from '../../queryClient';
import {
  cancelRestTimerNotification,
  scheduleRestTimerNotification,
} from '../../services/restTimerNotificationService';
import {
  loadLatestSetsForMachine,
  loadPreviousMaxesForMachines,
} from '../../services/workoutsService';
import {
  clearWorkoutDraft,
  saveWorkoutDraft,
} from '../../storage/workoutDraftStorage';
import { loadRestTimerSeconds } from '../../storage/restTimerSettingsStorage';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type {
  Machine,
  MuscleGroup,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';
import { EmptyWorkoutExerciseList } from './EmptyWorkoutExerciseList';
import { MachinePickerScreen } from './MachinePickerScreen';
import { MachineSuggestScreen } from './MachineSuggestScreen';
import { WorkoutExerciseCard } from './WorkoutExerciseCard';
import { RestTimerControl } from './RestTimerControl';
import {
  type SaveStatus,
  WorkoutSessionFooter,
} from './WorkoutSessionFooter';
import {
  createSetsForMachine,
  filterMachines,
  findWorkoutInputError,
  hasWorkoutChanged,
  normalizeWorkoutForSave,
  pickSuggestedMachines,
  shouldConfirmExitWorkout,
} from './workoutSessionModel';
import {
  createWorkoutSessionDraftState,
  workoutSessionDraftReducer,
} from './workoutSessionReducer';

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
  const [sessionState, dispatchSession] = useReducer(
    workoutSessionDraftReducer,
    workout,
    createWorkoutSessionDraftState,
  );
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
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);
  const [restTimerEndsAt, setRestTimerEndsAt] = useState<number | null>(null);
  const [restTimerNow, setRestTimerNow] = useState(() => Date.now());
  const keyboardBottomInset = useKeyboardBottomInset();
  const restTimerNotificationIdRef = useRef<string | null>(null);
  const {
    collapsedExerciseIds,
    draftWorkout,
    visibleSetNoteIds,
  } = sessionState;
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
    void loadRestTimerSeconds().then(setRestTimerSeconds);
  }, []);

  useEffect(() => {
    return () => {
      void cancelActiveRestTimerNotification();
    };
  }, []);

  useEffect(() => {
    if (restTimerEndsAt === null) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      const nextNow = Date.now();

      setRestTimerNow(nextNow);

      if (nextNow >= restTimerEndsAt) {
        setRestTimerEndsAt(null);
        restTimerNotificationIdRef.current = null;
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [restTimerEndsAt]);

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
    dispatchSession({ name, type: 'updateWorkoutName' });
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
      trackingType: machine.trackingType,
      sets: createSetsForMachine(machine, historySets),
    };
  }

  async function addExercise(machine: Machine) {
    const exercise = await createExerciseForMachine(machine);

    dispatchSession({ exercises: [exercise], type: 'addExercises' });
    closeMachinePicker();
  }

  async function addSuggestedMachinesToWorkout() {
    if (suggestedMachines.length === 0) {
      return;
    }

    const exercises = await Promise.all(suggestedMachines.map(createExerciseForMachine));

    dispatchSession({ exercises, type: 'addExercises' });
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
    dispatchSession({ exerciseId, type: 'deleteExercise' });
  }

  function addSet(exerciseId: string) {
    dispatchSession({ exerciseId, type: 'addSet' });
  }

  function clearExerciseSets(exerciseId: string) {
    dispatchSession({ exerciseId, type: 'clearExerciseSets' });
  }

  function updateSet(
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string,
  ) {
    dispatchSession({
      exerciseId,
      field,
      setId,
      type: 'updateSet',
      value,
    });
  }

  function deleteSet(exerciseId: string, setId: string) {
    dispatchSession({ exerciseId, setId, type: 'deleteSet' });
  }

  function toggleSetNote(setId: string) {
    dispatchSession({ setId, type: 'toggleSetNote' });
  }

  function toggleExerciseCollapse(exerciseId: string) {
    dispatchSession({ exerciseId, type: 'toggleExerciseCollapse' });
  }

  async function saveWorkout(closeAfterSave: boolean) {
    if (saveStatus === 'saving') {
      return;
    }

    const normalizedWorkout = normalizeWorkoutForSave(draftWorkout);
    const inputError = findWorkoutInputError(normalizedWorkout);

    if (inputError !== null) {
      showAppAlert(strings.alerts.invalidWorkoutTitle, inputError);
      return;
    }

    setSaveStatus('saving');

    if (closeAfterSave) {
      setRestTimerEndsAt(null);
      await cancelActiveRestTimerNotification();
    }

    const didSave = await onSave(normalizedWorkout, { closeAfterSave });

    if (didSave) {
      dispatchSession({ type: 'replaceWorkout', workout: normalizedWorkout });
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
      void cancelActiveRestTimer();
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
            void cancelActiveRestTimer();
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

  async function startRestTimer() {
    await cancelActiveRestTimerNotification();

    const nextEndsAt = Date.now() + restTimerSeconds * 1000;

    setRestTimerNow(Date.now());
    setRestTimerEndsAt(nextEndsAt);

    try {
      restTimerNotificationIdRef.current = await scheduleRestTimerNotification(
        restTimerSeconds,
      );

      if (restTimerNotificationIdRef.current === null) {
        showAppAlert(
          strings.alerts.notificationPermissionTitle,
          strings.alerts.notificationPermissionMessage,
        );
      }
    } catch {
      restTimerNotificationIdRef.current = null;
      showAppAlert(
        strings.alerts.notificationPermissionTitle,
        strings.alerts.notificationPermissionMessage,
      );
    }
  }

  async function cancelActiveRestTimer() {
    setRestTimerEndsAt(null);
    await cancelActiveRestTimerNotification();
  }

  async function cancelActiveRestTimerNotification() {
    const notificationId = restTimerNotificationIdRef.current;

    restTimerNotificationIdRef.current = null;
    await cancelRestTimerNotification(notificationId);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <SecondaryScreenHeader
          marginBottom={8}
          onBack={confirmExitWorkout}
          title={strings.workouts.sessionTitle}
        />

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

        <View
          style={[
            styles.bottomControls,
            keyboardBottomInset > 0 && { marginBottom: keyboardBottomInset },
          ]}
        >
          <WorkoutSessionFooter
            onFinish={() => {
              void saveWorkout(true);
            }}
            onRestTimerPress={() => {
              if (restTimerEndsAt === null) {
                void startRestTimer();
                return;
              }

              void cancelActiveRestTimer();
            }}
            onSave={() => {
              void saveWorkout(false);
            }}
            restTimerActive={restTimerEndsAt !== null}
            restTimerLabel={
              <RestTimerControl
                isActive={restTimerEndsAt !== null}
                remainingSeconds={
                  restTimerEndsAt === null
                    ? restTimerSeconds
                    : Math.max(0, Math.ceil((restTimerEndsAt - restTimerNow) / 1000))
                }
              />
            }
            saveStatus={saveStatus}
          />
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 2,
  },
  workoutTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  formInput: {
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    height: 46,
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
    paddingBottom: 8,
  },
  bottomControls: {
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    paddingBottom: 8,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  addMachineIconButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: '#B7D8C5',
    borderWidth: 1,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
