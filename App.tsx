import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { MachineFormScreen } from './src/features/machines/MachineFormScreen';
import { MachinesScreen } from './src/features/machines/MachinesScreen';
import { WorkoutsScreen } from './src/features/workouts/WorkoutsScreen';
import { loadMachines, saveMachines } from './src/storage/machinesStorage';
import { strings } from './src/strings';
import { colors } from './src/theme/colors';
import type { AppScreen, Machine, MainTab } from './src/types';

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
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  useEffect(() => {
    void loadStoredMachines();
  }, []);

  useEffect(() => {
    if (screen === 'home') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeMachineForm();
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

  async function persistMachines(nextMachines: Machine[]) {
    const saveResult = await saveMachines(nextMachines);

    if (saveResult.ok) {
      setMachines(nextMachines);
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

  function closeMachineForm() {
    setScreen('home');
    setEditingMachine(null);
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
                  isActive && styles.activeTab,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
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
          <WorkoutsScreen />
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
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: colors.active,
    borderColor: colors.activeText,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: colors.activeText,
  },
});
