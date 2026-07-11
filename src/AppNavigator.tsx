import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import type { StackScreenProps } from '@react-navigation/stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { showAppAlert } from './appAlert';
import { createNewWorkout, createRepeatedWorkout } from './appModel';
import { AppAlertHost } from './components/AppAlertHost';
import { AppHeader } from './components/AppHeader';
import { MainTabs } from './components/MainTabs';
import { MachineFormScreen } from './features/machines/MachineFormScreen';
import { MachinesScreen } from './features/machines/MachinesScreen';
import { BodyMeasurementsScreen } from './features/settings/BodyMeasurementsScreen';
import { RestTimerSettingsScreen } from './features/settings/RestTimerSettingsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { ThemeSettingsScreen } from './features/settings/ThemeSettingsScreen';
import { StatsScreen } from './features/stats/StatsScreen';
import { UserSelectScreen } from './features/users/UserSelectScreen';
import { WorkoutSessionScreen } from './features/workouts/WorkoutSessionScreen';
import { WorkoutsScreen } from './features/workouts/WorkoutsScreen';
import type { RootStackParamList } from './navigationTypes';
import {
  invalidateMachineQueries,
  invalidateWorkoutQueries,
  queryKeys,
} from './queryClient';
import { deleteMachine, loadMachines, saveMachine } from './services/machinesService';
import { loadUsers } from './services/usersService';
import { deleteWorkout, loadWorkout, saveWorkout } from './services/workoutsService';
import { loadSelectedUserId, saveSelectedUserId } from './storage/selectedUserStorage';
import { clearWorkoutDraft, loadWorkoutDraft } from './storage/workoutDraftStorage';
import { strings } from './strings';
import { useAppTheme } from './ThemeProvider';
import type { AppUser, Machine, MainTab, Workout, WorkoutSummary } from './types';

const Stack = createStackNavigator<RootStackParamList>();
const MIN_REFRESH_FEEDBACK_MS = 600;

type HomeScreenProps = StackScreenProps<RootStackParamList, 'Home'>;
type UserSelectRouteProps = StackScreenProps<RootStackParamList, 'UserSelect'>;

export function AppNavigator() {
  const { colors, themeName } = useAppTheme();
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.appBackground,
      card: colors.appBackground,
      border: colors.border,
      notification: colors.primary,
      primary: colors.primary,
      text: colors.text,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={themeName === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navigationTheme}>
        <MainStack />
      </NavigationContainer>
      <AppAlertHost />
    </SafeAreaProvider>
  );
}

function MainStack() {
  const { colors } = useAppTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MainTab>('workouts');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [hasLoadedSelectedUser, setHasLoadedSelectedUser] = useState(false);
  const [isRefreshingAllData, setIsRefreshingAllData] = useState(false);
  const usersQuery = useQuery({ queryKey: queryKeys.users, queryFn: loadUsers });
  const machinesQuery = useQuery({ queryKey: queryKeys.machines, queryFn: loadMachines });
  const users = usersQuery.data ?? [];
  const machines = machinesQuery.data ?? [];
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  useEffect(() => {
    async function restoreSelectedUser() {
      try {
        setSelectedUserId(await loadSelectedUserId());
      } catch {
        setSelectedUserId(null);
      } finally {
        setHasLoadedSelectedUser(true);
      }
    }

    void restoreSelectedUser();
  }, []);

  useEffect(() => {
    if (machinesQuery.isError || usersQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [machinesQuery.isError, usersQuery.isError]);

  async function refreshAllData() {
    if (isRefreshingAllData) {
      return;
    }

    setIsRefreshingAllData(true);
    const startedAt = Date.now();

    try {
      await queryClient.invalidateQueries();
    } finally {
      setTimeout(
        () => setIsRefreshingAllData(false),
        Math.max(0, MIN_REFRESH_FEEDBACK_MS - (Date.now() - startedAt)),
      );
    }
  }

  async function handleSelectUser(user: AppUser) {
    setSelectedUserId(user.id);
    void invalidateWorkoutQueries(queryClient, user.id);

    try {
      await saveSelectedUserId(user.id);
    } catch {
      showAppAlert(strings.alerts.userSaveTitle, strings.alerts.userSaveMessage);
    }
  }

  async function handleSaveMachine(machine: Machine): Promise<boolean> {
    try {
      await saveMachine(machine);
      await invalidateMachineQueries(queryClient);
      return true;
    } catch {
      showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
      return false;
    }
  }

  async function handleSaveWorkout(
    workout: Workout,
    closeAfterSave: boolean,
  ): Promise<boolean> {
    if (selectedUserId === null) {
      return false;
    }

    try {
      await saveWorkout(workout, selectedUserId);
      await invalidateWorkoutQueries(queryClient, selectedUserId);
      await clearWorkoutDraft(workout.id);
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
        { text: strings.actions.cancel, style: 'cancel' },
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => {
            void deleteMachine(machine.id)
              .then(() => invalidateMachineQueries(queryClient))
              .catch(() =>
                showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage),
              );
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
        { text: strings.actions.cancel, style: 'cancel' },
        {
          text: strings.actions.delete,
          style: 'destructive',
          onPress: () => {
            void deleteWorkout(workout.id)
              .then(() =>
                selectedUserId === null
                  ? undefined
                  : invalidateWorkoutQueries(queryClient, selectedUserId),
              )
              .catch(() =>
                showAppAlert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage),
              );
          },
        },
      ],
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        animation: 'none',
        cardStyle: { backgroundColor: colors.appBackground },
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home">
        {(props) => (
          <HomeScreen
            {...props}
            activeTab={activeTab}
            hasLoadedSelectedUser={hasLoadedSelectedUser}
            isRefreshingAllData={isRefreshingAllData}
            machines={machines}
            machinesLoading={machinesQuery.isLoading}
            onDeleteMachine={confirmDeleteMachine}
            onDeleteWorkout={confirmDeleteWorkout}
            onRefresh={() => void refreshAllData()}
            selectedUser={selectedUser}
            selectedUserId={selectedUserId}
            setActiveTab={setActiveTab}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="UserSelect">
        {(props) => (
          <UserSelectRoute
            {...props}
            currentUserId={selectedUserId}
            onSelectUser={handleSelectUser}
            users={users}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Settings">
        {({ navigation }) => (
          <SettingsScreen
            backgroundColor={colors.appBackground}
            currentUser={selectedUser}
            onBack={() => navigation.goBack()}
            onChangeUser={() => navigation.navigate('UserSelect')}
            onOpenBodyMeasurements={() => navigation.navigate('BodyMeasurements')}
            onOpenRestTimerSettings={() => navigation.navigate('RestTimerSettings')}
            onOpenThemeSettings={() => navigation.navigate('ThemeSettings')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ThemeSettings">
        {({ navigation }) => (
          <ThemeSettingsScreen
            backgroundColor={colors.appBackground}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="RestTimerSettings">
        {({ navigation }) => (
          <RestTimerSettingsScreen
            backgroundColor={colors.appBackground}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="BodyMeasurements">
        {({ navigation }) => (
          <BodyMeasurementsScreen
            backgroundColor={colors.appBackground}
            onBack={() => navigation.goBack()}
            userId={selectedUserId}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="MachineForm">
        {({ navigation, route }) => (
          <MachineFormScreen
            backgroundColor={colors.appBackground}
            machine={route.params.machine}
            onBack={() => navigation.goBack()}
            onDelete={confirmDeleteMachine}
            onSave={(machine) => {
              void handleSaveMachine(machine).then((wasSaved) => {
                if (wasSaved) {
                  navigation.goBack();
                }
              });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="WorkoutSession">
        {({ navigation, route }) => (
          <WorkoutSessionScreen
            backgroundColor={colors.appBackground}
            isNewWorkout={route.params.isNewWorkout}
            machines={machines}
            onBack={() => navigation.goBack()}
            onSave={async (workout, options) => {
              const wasSaved = await handleSaveWorkout(workout, options.closeAfterSave);

              if (wasSaved && options.closeAfterSave) {
                navigation.goBack();
              }

              return wasSaved;
            }}
            userId={selectedUserId ?? route.params.workout.userId}
            workout={route.params.workout}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

type HomeScreenExtraProps = {
  activeTab: MainTab;
  hasLoadedSelectedUser: boolean;
  isRefreshingAllData: boolean;
  machines: Machine[];
  machinesLoading: boolean;
  onDeleteMachine: (machine: Machine) => void;
  onDeleteWorkout: (workout: WorkoutSummary) => void;
  onRefresh: () => void;
  selectedUser: AppUser | null;
  selectedUserId: string | null;
  setActiveTab: (tab: MainTab) => void;
};

function HomeScreen({
  activeTab,
  hasLoadedSelectedUser,
  isRefreshingAllData,
  machines,
  machinesLoading,
  navigation,
  onDeleteMachine,
  onDeleteWorkout,
  onRefresh,
  selectedUser,
  selectedUserId,
  setActiveTab,
}: HomeScreenProps & HomeScreenExtraProps) {
  const { colors } = useAppTheme();
  const [checkedDraftUserId, setCheckedDraftUserId] = useState<string | null>(null);

  useEffect(() => {
    if (hasLoadedSelectedUser && selectedUser === null) {
      navigation.replace('UserSelect');
    }
  }, [hasLoadedSelectedUser, navigation, selectedUser]);

  useEffect(() => {
    if (selectedUser === null || checkedDraftUserId === selectedUser.id) {
      return;
    }

    setCheckedDraftUserId(selectedUser.id);
    void loadWorkoutDraft().then((draft) => {
      if (draft === null || draft.userId !== selectedUser.id) {
        return;
      }

      showAppAlert(
        strings.alerts.restoreWorkoutDraftTitle,
        strings.alerts.restoreWorkoutDraftMessage,
        [
          {
            text: strings.actions.delete,
            style: 'destructive',
            onPress: () => void clearWorkoutDraft(draft.workout.id),
          },
          {
            text: strings.actions.restore,
            onPress: () => {
              setActiveTab('workouts');
              navigation.navigate('WorkoutSession', {
                isNewWorkout: true,
                workout: draft.workout,
              });
            },
          },
        ],
      );
    });
  }, [checkedDraftUserId, navigation, selectedUser, setActiveTab]);

  async function openWorkoutSession(workout: WorkoutSummary) {
    try {
      navigation.navigate('WorkoutSession', {
        isNewWorkout: false,
        workout: await loadWorkout(workout.id),
      });
    } catch {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }

  async function repeatWorkout(workout: WorkoutSummary) {
    if (selectedUserId === null) {
      navigation.navigate('UserSelect');
      return;
    }

    try {
      navigation.navigate('WorkoutSession', {
        isNewWorkout: true,
        workout: createRepeatedWorkout({
          sourceWorkout: await loadWorkout(workout.id),
          userId: selectedUserId,
        }),
      });
    } catch {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor: colors.appBackground }]}
    >
      <AppHeader
        isRefreshingAllData={isRefreshingAllData}
        onOpenSettings={() => navigation.navigate('Settings')}
        onRefreshAllData={onRefresh}
      />
      <MainTabs activeTab={activeTab} onSelectTab={setActiveTab} />
      {activeTab === 'machines' ? (
        <MachinesScreen
          isLoading={machinesLoading}
          machines={machines}
          onAddMachine={() => navigation.navigate('MachineForm', { machine: null })}
          onEditMachine={(machine) => navigation.navigate('MachineForm', { machine })}
        />
      ) : activeTab === 'stats' ? (
        <StatsScreen userId={selectedUserId} />
      ) : (
        <WorkoutsScreen
          onDeleteWorkout={onDeleteWorkout}
          onEditWorkout={(workout) => void openWorkoutSession(workout)}
          onRepeatWorkout={(workout) => void repeatWorkout(workout)}
          onStartWorkout={() => {
            if (selectedUserId === null) {
              navigation.navigate('UserSelect');
              return;
            }

            navigation.navigate('WorkoutSession', {
              isNewWorkout: true,
              workout: createNewWorkout(selectedUserId),
            });
          }}
          userId={selectedUserId}
        />
      )}
    </SafeAreaView>
  );
}

type UserSelectRouteExtraProps = {
  currentUserId: string | null;
  onSelectUser: (user: AppUser) => Promise<void>;
  users: AppUser[];
};

function UserSelectRoute({
  currentUserId,
  navigation,
  onSelectUser,
  users,
}: UserSelectRouteProps & UserSelectRouteExtraProps) {
  return (
    <UserSelectScreen
      currentUserId={currentUserId}
      onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
      onSelectUser={(user) => {
        void onSelectUser(user).then(() => {
          if (navigation.canGoBack()) {
            navigation.popToTop();
          } else {
            navigation.replace('Home');
          }
        });
      }}
      users={users}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
});
