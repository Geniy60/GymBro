import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { MachineFormScreen } from './src/features/machines/MachineFormScreen';
import { MachinesScreen } from './src/features/machines/MachinesScreen';
import { WorkoutFormScreen } from './src/features/workouts/WorkoutFormScreen';
import { WorkoutsScreen } from './src/features/workouts/WorkoutsScreen';
import { loadMachines, saveMachines } from './src/storage/machinesStorage';
import { loadWorkouts, saveWorkouts } from './src/storage/workoutsStorage';
import { strings } from './src/strings';
import { colors } from './src/theme/colors';
import type { AppScreen, Machine, MainTab, Workout } from './src/types';

type TabConfig = {
  key: MainTab;
  label: string;
};

const tabs: TabConfig[] = [
  {
    key: 'machines',
    label: strings.tabs.machines,
  },
  {
    key: 'workouts',
    label: strings.tabs.workouts,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('machines');
  const [screen, setScreen] = useState<AppScreen>('home');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  useEffect(() => {
    void loadStoredMachines();
    void loadStoredWorkouts();
  }, []);

  useEffect(() => {
    if (screen === 'home') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeFormScreen();
      return true;
    });

    return () => subscription.remove();
  }, [screen]);

  async function loadStoredMachines() {
    const loadResult = await loadMachines();

    if (loadResult.ok) {
      setMachines(loadResult.machines);
      return;
    }

    Alert.alert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
  }

  async function loadStoredWorkouts() {
    const loadResult = await loadWorkouts();

    if (loadResult.ok) {
      setWorkouts(loadResult.workouts);
      return;
    }

    Alert.alert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
  }

  async function persistMachines(nextMachines: Machine[]) {
    const saveResult = await saveMachines(nextMachines);

    if (saveResult.ok) {
      setMachines(nextMachines);
      return true;
    }

    Alert.alert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    return false;
  }

  async function persistWorkouts(nextWorkouts: Workout[]) {
    const saveResult = await saveWorkouts(nextWorkouts);

    if (saveResult.ok) {
      setWorkouts(nextWorkouts);
      return true;
    }

    Alert.alert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
    return false;
  }

  function openAddMachineForm() {
    setEditingMachine(null);
    setScreen('machineForm');
  }

  function openEditMachineForm(machine: Machine) {
    setEditingMachine(machine);
    setScreen('machineForm');
  }

  function openAddWorkoutForm() {
    setEditingWorkout(null);
    setScreen('workoutForm');
  }

  function openEditWorkoutForm(workout: Workout) {
    setEditingWorkout(workout);
    setScreen('workoutForm');
  }

  function closeMachineForm() {
    setScreen('home');
    setEditingMachine(null);
  }

  function closeWorkoutForm() {
    setScreen('home');
    setEditingWorkout(null);
  }

  function closeFormScreen() {
    if (screen === 'machineForm') {
      closeMachineForm();
      return;
    }

    if (screen === 'workoutForm') {
      closeWorkoutForm();
    }
  }

  async function handleSaveMachine(machine: Machine) {
    const nextMachines =
      editingMachine === null
        ? [...machines, machine]
        : machines.map((currentMachine) =>
            currentMachine.id === machine.id ? machine : currentMachine,
          );

    const didSave = await persistMachines(nextMachines);

    if (didSave) {
      closeMachineForm();
    }
  }

  async function handleSaveWorkout(workout: Workout) {
    const nextWorkouts =
      editingWorkout === null
        ? [...workouts, workout]
        : workouts.map((currentWorkout) =>
            currentWorkout.id === workout.id ? workout : currentWorkout,
          );

    const didSave = await persistWorkouts(nextWorkouts);

    if (didSave) {
      closeWorkoutForm();
    }
  }

  function confirmDeleteMachine(machine: Machine) {
    Alert.alert(
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
            void persistMachines(
              machines.filter((currentMachine) => currentMachine.id !== machine.id),
            );
          },
        },
      ],
    );
  }

  function confirmDeleteWorkout(workout: Workout) {
    Alert.alert(
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
            void persistWorkouts(
              workouts.filter((currentWorkout) => currentWorkout.id !== workout.id),
            );
          },
        },
      ],
    );
  }

  if (screen === 'machineForm') {
    return (
      <SafeAreaProvider>
        <MachineFormScreen
          machine={editingMachine}
          onBack={closeMachineForm}
          onSave={(machine) => {
            void handleSaveMachine(machine);
          }}
        />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  if (screen === 'workoutForm') {
    return (
      <SafeAreaProvider>
        <WorkoutFormScreen
          onBack={closeWorkoutForm}
          onSave={(workout) => {
            void handleSaveWorkout(workout);
          }}
          workout={editingWorkout}
        />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>{strings.app.title}</Text>
          <Pressable
            accessibilityLabel={strings.accessibility.settings}
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
                  tab.key === 'machines' ? styles.machinesTab : styles.workoutsTab,
                  isActive && styles.activeTab,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    tab.key === 'machines'
                      ? styles.machinesTabLabel
                      : styles.workoutsTabLabel,
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
        ) : (
          <WorkoutsScreen
            onAddWorkout={openAddWorkoutForm}
            onDeleteWorkout={confirmDeleteWorkout}
            onEditWorkout={openEditWorkoutForm}
            workouts={workouts}
          />
        )}

        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: '#DFEAF7',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    marginHorizontal: 20,
    marginTop: 14,
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
    backgroundColor: '#DCFCE7',
  },
  workoutsTab: {
    backgroundColor: '#EDE9FE',
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
  activeTabLabel: {
    color: colors.text,
  },
});
