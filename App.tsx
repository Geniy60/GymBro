import {
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { showAppAlert } from './src/appAlert';
import {
  createNewWorkout,
  createRepeatedWorkout,
  getAppBackgroundColor,
} from './src/appModel';
import { AppHeader } from './src/components/AppHeader';
import { AppAlertHost } from './src/components/AppAlertHost';
import { MainTabs } from './src/components/MainTabs';
import { MachineFormScreen } from './src/features/machines/MachineFormScreen';
import { MachinesScreen } from './src/features/machines/MachinesScreen';
import { BodyMeasurementsScreen } from './src/features/settings/BodyMeasurementsScreen';
import { RestTimerSettingsScreen } from './src/features/settings/RestTimerSettingsScreen';
import { SettingsScreen } from './src/features/settings/SettingsScreen';
import { StatsScreen } from './src/features/stats/StatsScreen';
import { UserSelectScreen } from './src/features/users/UserSelectScreen';
import { WorkoutSessionScreen } from './src/features/workouts/WorkoutSessionScreen';
import { WorkoutsScreen } from './src/features/workouts/WorkoutsScreen';
import {
  invalidateMachineQueries,
  invalidateWorkoutQueries,
  queryClient,
  queryKeys,
} from './src/queryClient';
import {
  deleteMachine,
  loadMachines,
  saveMachine,
} from './src/services/machinesService';
import { loadUsers } from './src/services/usersService';
import {
  deleteWorkout,
  loadWorkout,
  saveWorkout,
} from './src/services/workoutsService';
import {
  loadSelectedUserId,
  saveSelectedUserId,
} from './src/storage/selectedUserStorage';
import {
  clearWorkoutDraft,
  loadWorkoutDraft,
} from './src/storage/workoutDraftStorage';
import { strings } from './src/strings';
import type {
  AppScreen,
  AppUser,
  Machine,
  MainTab,
  Workout,
  WorkoutSummary,
} from './src/types';

const MIN_REFRESH_FEEDBACK_MS = 600;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<MainTab>('workouts');
  const [screen, setScreen] = useState<AppScreen>('home');
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isEditingWorkoutNew, setIsEditingWorkoutNew] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hasLoadedSelectedUser, setHasLoadedSelectedUser] = useState(false);
  const [isRefreshingAllData, setIsRefreshingAllData] = useState(false);
  const [checkedWorkoutDraftUserId, setCheckedWorkoutDraftUserId] = useState<
    string | null
  >(null);
  const queryClientInstance = useQueryClient();
  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: loadUsers,
  });
  const shouldLoadMachines =
    activeTab === 'machines' ||
    screen === 'machineForm' ||
    screen === 'workoutSession';
  const machinesQuery = useQuery({
    enabled: shouldLoadMachines,
    queryKey: queryKeys.machines,
    queryFn: loadMachines,
  });
  const users = usersQuery.data ?? [];
  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? null;
  const machines = machinesQuery.data ?? [];
  const appBackgroundColor = getAppBackgroundColor();

  useEffect(() => {
    void loadStoredSelectedUser();
  }, []);

  useEffect(() => {
    if (machinesQuery.isError || usersQuery.isError) {
      console.error('GymBro data load error', {
        machines: machinesQuery.error,
        users: usersQuery.error,
      });
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [
    machinesQuery.error,
    machinesQuery.isError,
    usersQuery.error,
    usersQuery.isError,
  ]);

  useEffect(() => {
    if (!hasLoadedSelectedUser || usersQuery.isLoading || users.length === 0) {
      return;
    }

    if (selectedUser === null) {
      setScreen('userSelect');
    }
  }, [hasLoadedSelectedUser, selectedUser, users.length, usersQuery.isLoading]);

  useEffect(() => {
    if (
      selectedUser === null ||
      checkedWorkoutDraftUserId === selectedUser.id ||
      screen !== 'home'
    ) {
      return;
    }

    setCheckedWorkoutDraftUserId(selectedUser.id);
    void offerStoredWorkoutDraft(selectedUser.id);
  }, [checkedWorkoutDraftUserId, screen, selectedUser]);

  useEffect(() => {
    if (
      screen !== 'machineForm' &&
      screen !== 'settings' &&
      screen !== 'restTimerSettings' &&
      screen !== 'bodyMeasurements'
    ) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'machineForm') {
        closeMachineForm();
        return true;
      }

      if (screen === 'settings') {
        closeSettings();
        return true;
      }

      openSettings();
      return true;
    });

    return () => subscription.remove();
  }, [screen]);

  async function loadStoredSelectedUser() {
    try {
      setSelectedUserId(await loadSelectedUserId());
    } catch {
      setSelectedUserId(null);
    } finally {
      setHasLoadedSelectedUser(true);
    }
  }

  function openAddMachineForm() {
    setEditingMachine(null);
    setScreen('machineForm');
  }

  function openEditMachineForm(machine: Machine) {
    setEditingMachine(machine);
    setScreen('machineForm');
  }

  function startWorkout() {
    if (selectedUserId === null) {
      setScreen('userSelect');
      return;
    }

    setEditingWorkout(createNewWorkout(selectedUserId));
    setIsEditingWorkoutNew(true);
    setScreen('workoutSession');
  }

  async function openWorkoutSession(workout: WorkoutSummary) {
    try {
      setEditingWorkout(await loadWorkout(workout.id));
      setIsEditingWorkoutNew(false);
      setScreen('workoutSession');
    } catch {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }

  async function repeatWorkout(workout: WorkoutSummary) {
    if (selectedUserId === null) {
      setScreen('userSelect');
      return;
    }

    let sourceWorkout: Workout;

    try {
      sourceWorkout = await loadWorkout(workout.id);
    } catch {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
      return;
    }

    setEditingWorkout(
      createRepeatedWorkout({
        sourceWorkout,
        userId: selectedUserId,
      }),
    );
    setIsEditingWorkoutNew(true);
    setScreen('workoutSession');
  }

  function closeMachineForm() {
    setScreen('home');
    setEditingMachine(null);
  }

  function closeWorkoutForm() {
    setScreen('home');
    setEditingWorkout(null);
    setIsEditingWorkoutNew(false);
  }

  function openSettings() {
    setScreen('settings');
  }

  async function refreshAllData() {
    if (isRefreshingAllData) {
      return;
    }

    setIsRefreshingAllData(true);
    const refreshStartedAt = Date.now();

    try {
      await queryClientInstance.invalidateQueries();
    } finally {
      const elapsedMs = Date.now() - refreshStartedAt;
      const remainingFeedbackMs = Math.max(
        0,
        MIN_REFRESH_FEEDBACK_MS - elapsedMs,
      );

      setTimeout(() => {
        setIsRefreshingAllData(false);
      }, remainingFeedbackMs);
    }
  }

  function closeSettings() {
    setScreen('home');
  }

  function openRestTimerSettings() {
    setScreen('restTimerSettings');
  }

  function openBodyMeasurements() {
    setScreen('bodyMeasurements');
  }

  function openUserSelect() {
    setScreen('userSelect');
  }

  async function handleSelectUser(user: AppUser) {
    setSelectedUserId(user.id);
    setScreen('home');
    void invalidateWorkoutData(user.id);

    try {
      await saveSelectedUserId(user.id);
    } catch {
      showAppAlert(strings.alerts.userSaveTitle, strings.alerts.userSaveMessage);
    }
  }

  async function handleSaveMachine(machine: Machine) {
    try {
      await saveMachine(machine);
      await invalidateMachineQueries(queryClientInstance);
      closeMachineForm();
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    }
  }

  async function handleSaveWorkout(
    workout: Workout,
    options: { closeAfterSave: boolean },
  ): Promise<boolean> {
    if (selectedUserId === null) {
      setScreen('userSelect');
      return false;
    }

    try {
      await saveWorkout(workout, selectedUserId);
      await invalidateWorkoutData(selectedUserId);
      await clearWorkoutDraft(workout.id);
      if (options.closeAfterSave) {
        closeWorkoutForm();
      } else {
        setEditingWorkout(workout);
        setIsEditingWorkoutNew(false);
      }
      return true;
    } catch {
      return false;
    }
  }

  function confirmDeleteMachine(machine: Machine) {
    showAppAlert(
      strings.alerts.deleteMachineTitle,
      strings.alerts.deleteMachineMessage(machine.name),
      [
        {
          text: strings.actions.cancel,
          style: 'cancel',
        },
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => {
            void handleDeleteMachine(machine.id);
          },
        },
      ],
    );
  }

  function confirmDeleteWorkout(workout: WorkoutSummary) {
    showAppAlert(
      strings.alerts.deleteWorkoutTitle,
      strings.alerts.deleteWorkoutMessage(workout.name),
      [
        {
          text: strings.actions.cancel,
          style: 'cancel',
        },
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => {
            void handleDeleteWorkout(workout.id);
          },
        },
      ],
    );
  }

  async function handleDeleteMachine(machineId: string) {
    try {
      await deleteMachine(machineId);
      await invalidateMachineQueries(queryClientInstance);
      if (editingMachine?.id === machineId) {
        closeMachineForm();
      }
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    }
  }

  async function handleDeleteWorkout(workoutId: string) {
    try {
      await deleteWorkout(workoutId);
      if (selectedUserId !== null) {
        await invalidateWorkoutData(selectedUserId);
      }
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    }
  }

  async function offerStoredWorkoutDraft(userId: string) {
    const draft = await loadWorkoutDraft();

    if (draft === null || draft.userId !== userId) {
      return;
    }

    showAppAlert(
      strings.alerts.restoreWorkoutDraftTitle,
      strings.alerts.restoreWorkoutDraftMessage,
      [
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => {
            void clearWorkoutDraft(draft.workout.id);
          },
        },
        {
          text: strings.actions.restore,
          onPress: () => {
            setEditingWorkout(draft.workout);
            setIsEditingWorkoutNew(true);
            setActiveTab('workouts');
            setScreen('workoutSession');
          },
        },
      ],
    );
  }

  async function invalidateWorkoutData(userId: string) {
    await invalidateWorkoutQueries(queryClientInstance, userId);
  }

  if (screen === 'userSelect') {
    return (
      <SafeAreaProvider>
        <UserSelectScreen
          currentUserId={selectedUserId}
          onBack={selectedUser === null ? undefined : closeSettings}
          onSelectUser={(user) => {
            void handleSelectUser(user);
          }}
          users={users}
        />
        <StatusBar style="dark" />
        <AppAlertHost />
      </SafeAreaProvider>
    );
  }

  if (screen === 'settings') {
    return (
      <SafeAreaProvider>
        <SettingsScreen
          backgroundColor={appBackgroundColor}
          currentUser={selectedUser}
          onBack={closeSettings}
          onChangeUser={openUserSelect}
          onOpenBodyMeasurements={openBodyMeasurements}
          onOpenRestTimerSettings={openRestTimerSettings}
        />
        <StatusBar style="dark" />
        <AppAlertHost />
      </SafeAreaProvider>
    );
  }

  if (screen === 'restTimerSettings') {
    return (
      <SafeAreaProvider>
        <RestTimerSettingsScreen
          backgroundColor={appBackgroundColor}
          onBack={openSettings}
        />
        <StatusBar style="dark" />
        <AppAlertHost />
      </SafeAreaProvider>
    );
  }

  if (screen === 'bodyMeasurements') {
    return (
      <SafeAreaProvider>
        <BodyMeasurementsScreen
          backgroundColor={appBackgroundColor}
          onBack={openSettings}
          userId={selectedUserId}
        />
        <StatusBar style="dark" />
        <AppAlertHost />
      </SafeAreaProvider>
    );
  }

  if (screen === 'machineForm') {
    return (
      <SafeAreaProvider>
        <MachineFormScreen
          backgroundColor={appBackgroundColor}
          machine={editingMachine}
          onBack={closeMachineForm}
          onDelete={confirmDeleteMachine}
          onSave={(machine) => {
            void handleSaveMachine(machine);
          }}
        />
        <StatusBar style="dark" />
        <AppAlertHost />
      </SafeAreaProvider>
    );
  }

  if (screen === 'workoutSession' && editingWorkout !== null) {
    return (
      <SafeAreaProvider>
        <WorkoutSessionScreen
          backgroundColor={appBackgroundColor}
          isNewWorkout={isEditingWorkoutNew}
          machines={machines}
          onBack={closeWorkoutForm}
          onSave={handleSaveWorkout}
          userId={selectedUserId ?? editingWorkout.userId}
          workout={editingWorkout}
        />
        <StatusBar style="dark" />
        <AppAlertHost />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={[styles.safeArea, { backgroundColor: appBackgroundColor }]}
      >
        <AppHeader
          isRefreshingAllData={isRefreshingAllData}
          onOpenSettings={openSettings}
          onRefreshAllData={() => {
            void refreshAllData();
          }}
        />

        <MainTabs activeTab={activeTab} onSelectTab={setActiveTab} />

        {activeTab === 'machines' ? (
          <MachinesScreen
            isLoading={machinesQuery.isLoading}
            machines={machines}
            onAddMachine={openAddMachineForm}
            onEditMachine={openEditMachineForm}
          />
        ) : activeTab === 'stats' ? (
          <StatsScreen userId={selectedUserId} />
        ) : (
          <WorkoutsScreen
            onDeleteWorkout={confirmDeleteWorkout}
            onEditWorkout={(workout) => {
              void openWorkoutSession(workout);
            }}
            onRepeatWorkout={(workout) => {
              void repeatWorkout(workout);
            }}
            onStartWorkout={startWorkout}
            userId={selectedUserId}
          />
        )}

        <StatusBar style="dark" />
        <AppAlertHost />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
