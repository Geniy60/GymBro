import { Ionicons } from '@expo/vector-icons';
import {
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { showAppAlert } from './src/appAlert';
import { AppAlertHost } from './src/components/AppAlertHost';
import { MachineFormScreen } from './src/features/machines/MachineFormScreen';
import { MachinesScreen } from './src/features/machines/MachinesScreen';
import { SettingsScreen } from './src/features/settings/SettingsScreen';
import { StatsScreen } from './src/features/stats/StatsScreen';
import { UserSelectScreen } from './src/features/users/UserSelectScreen';
import { WorkoutSessionScreen } from './src/features/workouts/WorkoutSessionScreen';
import { WorkoutsScreen } from './src/features/workouts/WorkoutsScreen';
import { queryClient, queryKeys } from './src/queryClient';
import {
  deleteMachine,
  loadMachines,
  saveMachine,
} from './src/services/machinesService';
import { loadUsers } from './src/services/usersService';
import {
  deleteWorkout,
  loadWorkouts,
  saveWorkout,
} from './src/services/workoutsService';
import {
  loadSelectedUserId,
  saveSelectedUserId,
} from './src/storage/selectedUserStorage';
import { strings } from './src/strings';
import { colors } from './src/theme/colors';
import type { AppScreen, AppUser, Machine, MainTab, Workout } from './src/types';

type TabConfig = {
  key: MainTab;
  label: string;
};

const tabs: TabConfig[] = [
  {
    key: 'workouts',
    label: strings.tabs.workouts,
  },
  {
    key: 'stats',
    label: strings.tabs.stats,
  },
  {
    key: 'machines',
    label: strings.tabs.machines,
  },
];

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hasLoadedSelectedUser, setHasLoadedSelectedUser] = useState(false);
  const queryClientInstance = useQueryClient();
  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: loadUsers,
  });
  const machinesQuery = useQuery({
    queryKey: queryKeys.machines,
    queryFn: loadMachines,
  });
  const workoutsQuery = useQuery({
    enabled: selectedUserId !== null,
    queryKey: queryKeys.workouts(selectedUserId ?? 'none'),
    queryFn: () => loadWorkouts(selectedUserId ?? ''),
  });
  const users = usersQuery.data ?? [];
  const selectedUser =
    users.find((user) => user.id === selectedUserId) ?? null;
  const machines = machinesQuery.data ?? [];
  const workouts = workoutsQuery.data ?? [];
  const appBackgroundColor = getUserBackgroundColor(selectedUserId);

  useEffect(() => {
    void loadStoredSelectedUser();
  }, []);

  useEffect(() => {
    if (machinesQuery.isError || workoutsQuery.isError || usersQuery.isError) {
      console.error('GymBro data load error', {
        machines: machinesQuery.error,
        users: usersQuery.error,
        workouts: workoutsQuery.error,
      });
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [
    machinesQuery.error,
    machinesQuery.isError,
    usersQuery.error,
    usersQuery.isError,
    workoutsQuery.error,
    workoutsQuery.isError,
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
    if (screen !== 'machineForm' && screen !== 'settings') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'machineForm') {
        closeMachineForm();
        return true;
      }

      closeSettings();
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

    setEditingWorkout({
      id: createId(),
      userId: selectedUserId,
      name: createDefaultWorkoutName(),
      startedAt: new Date().toISOString(),
      exercises: [],
    });
    setScreen('workoutSession');
  }

  function openWorkoutSession(workout: Workout) {
    setEditingWorkout(workout);
    setScreen('workoutSession');
  }

  function repeatWorkout(workout: Workout) {
    if (selectedUserId === null) {
      setScreen('userSelect');
      return;
    }

    setEditingWorkout({
      id: createId(),
      userId: selectedUserId,
      name: createDefaultWorkoutName(),
      startedAt: new Date().toISOString(),
      exercises: workout.exercises.map((exercise) => ({
        ...exercise,
        id: createId(),
        sets: exercise.sets.map((workoutSet) => ({
          ...workoutSet,
          id: createId(),
        })),
      })),
    });
    setScreen('workoutSession');
  }

  function closeMachineForm() {
    setScreen('home');
    setEditingMachine(null);
  }

  function closeWorkoutForm() {
    setScreen('home');
    setEditingWorkout(null);
  }

  function openSettings() {
    setScreen('settings');
  }

  function closeSettings() {
    setScreen('home');
  }

  function openUserSelect() {
    setScreen('userSelect');
  }

  async function handleSelectUser(user: AppUser) {
    setSelectedUserId(user.id);
    setScreen('home');
    void queryClientInstance.invalidateQueries({
      queryKey: queryKeys.workouts(user.id),
    });

    try {
      await saveSelectedUserId(user.id);
    } catch {
      showAppAlert(strings.alerts.userSaveTitle, strings.alerts.userSaveMessage);
    }
  }

  async function handleSaveMachine(machine: Machine) {
    try {
      await saveMachine(machine);
      await queryClientInstance.invalidateQueries({ queryKey: queryKeys.machines });
      closeMachineForm();
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    }
  }

  async function handleSaveWorkout(workout: Workout) {
    if (selectedUserId === null) {
      setScreen('userSelect');
      return;
    }

    try {
      await saveWorkout(workout, selectedUserId);
      await queryClientInstance.invalidateQueries({
        queryKey: queryKeys.workouts(selectedUserId),
      });
      closeWorkoutForm();
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
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

  function confirmDeleteWorkout(workout: Workout) {
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
      await queryClientInstance.invalidateQueries({ queryKey: queryKeys.machines });
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    }
  }

  async function handleDeleteWorkout(workoutId: string) {
    try {
      await deleteWorkout(workoutId);
      if (selectedUserId !== null) {
        await queryClientInstance.invalidateQueries({
          queryKey: queryKeys.workouts(selectedUserId),
        });
      }
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    }
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
          isNewWorkout={workouts.every(
            (currentWorkout) => currentWorkout.id !== editingWorkout.id,
          )}
          machines={machines}
          onBack={closeWorkoutForm}
          onSave={(workout) => {
            void handleSaveWorkout(workout);
          }}
          previousWorkouts={workouts}
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
        <View style={styles.header}>
          <Text style={styles.appTitle}>{strings.app.title}</Text>
          <Pressable
            accessibilityLabel={strings.accessibility.settings}
            onPress={openSettings}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="settings-outline" size={26} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={({ pressed }) => [
                  styles.tab,
                  tab.key === 'machines' && styles.machinesTab,
                  tab.key === 'stats' && styles.statsTab,
                  tab.key === 'workouts' && styles.workoutsTab,
                  isActive && styles.activeTab,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    tab.key === 'machines' && styles.machinesTabLabel,
                    tab.key === 'stats' && styles.statsTabLabel,
                    tab.key === 'workouts' && styles.workoutsTabLabel,
                    isActive && styles.activeTabLabel,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'machines' ? (
          <MachinesScreen
            machines={machines}
            onAddMachine={openAddMachineForm}
            onDeleteMachine={confirmDeleteMachine}
            onEditMachine={openEditMachineForm}
          />
        ) : activeTab === 'stats' ? (
          <StatsScreen workouts={workouts} />
        ) : (
          <WorkoutsScreen
            onDeleteWorkout={confirmDeleteWorkout}
            onEditWorkout={openWorkoutSession}
            onRepeatWorkout={repeatWorkout}
            onStartWorkout={startWorkout}
            workouts={workouts}
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  appTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  settingsButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 44,
  },
  pressedButton: {
    opacity: 0.7,
  },
  tabRow: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    marginHorizontal: 20,
    marginTop: 6,
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  machinesTab: {
    backgroundColor: '#CFF7D3',
  },
  workoutsTab: {
    backgroundColor: '#DDD6FE',
  },
  statsTab: {
    backgroundColor: '#FEF3C7',
  },
  activeTab: {
    borderColor: colors.text,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  machinesTabLabel: {
    color: '#166534',
  },
  workoutsTabLabel: {
    color: '#6D28D9',
  },
  statsTabLabel: {
    color: '#92400E',
  },
  activeTabLabel: {
    color: colors.text,
  },
});

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createDefaultWorkoutName() {
  const today = new Date();
  const weekday = today.toLocaleDateString('ru-RU', { weekday: 'long' });
  const formattedWeekday = weekday.charAt(0).toLocaleUpperCase('ru-RU') + weekday.slice(1);

  return strings.workouts.defaultNameWithDate(
    formattedWeekday,
    today.toLocaleDateString('ru-RU'),
  );
}

function getUserBackgroundColor(userId: string | null): string {
  if (userId === 'gymbro-user-nastya') {
    return colors.nastyaBackground;
  }

  if (userId === 'gymbro-user-zhenya') {
    return colors.zhenyaBackground;
  }

  return colors.background;
}
