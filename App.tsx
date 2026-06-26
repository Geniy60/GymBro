import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { strings } from './src/strings';

type MainTab = 'machines' | 'workouts';
type AppScreen = 'home' | 'machineForm';

type Machine = {
  id: string;
  name: string;
  muscleGroup: string;
  note: string;
};

type MachineDraft = {
  name: string;
  muscleGroup: string;
  note: string;
};

type TabConfig = {
  key: MainTab;
  label: string;
  emptyTitle: string;
  emptyMessage: string;
  searchPlaceholder: string;
};

const machinesStorageKey = 'gymbro.machines.v1';

const emptyMachineDraft: MachineDraft = {
  name: '',
  muscleGroup: '',
  note: '',
};

const tabs: TabConfig[] = [
  {
    key: 'machines',
    label: strings.tabs.machines,
    emptyTitle: strings.empty.machines.title,
    emptyMessage: strings.empty.machines.message,
    searchPlaceholder: strings.search.machines,
  },
  {
    key: 'workouts',
    label: strings.tabs.workouts,
    emptyTitle: strings.empty.workouts.title,
    emptyMessage: strings.empty.workouts.message,
    searchPlaceholder: strings.search.workouts,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('machines');
  const [screen, setScreen] = useState<AppScreen>('home');
  const [searchText, setSearchText] = useState('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [machineDraft, setMachineDraft] = useState<MachineDraft>(emptyMachineDraft);
  const [machineNameError, setMachineNameError] = useState('');

  const selectedTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const isEditingMachine = editingMachineId !== null;

  const filteredMachines = useMemo(() => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase();

    if (normalizedSearch.length === 0) {
      return machines;
    }

    return machines.filter((machine) => {
      const searchableText = [
        machine.name,
        machine.muscleGroup,
        machine.note,
      ].join(' ').toLocaleLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [machines, searchText]);

  useEffect(() => {
    void loadMachines();
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

  async function loadMachines() {
    try {
      const storedValue = await AsyncStorage.getItem(machinesStorageKey);

      if (storedValue === null) {
        return;
      }

      const parsedValue: unknown = JSON.parse(storedValue);

      if (isMachineList(parsedValue)) {
        setMachines(parsedValue);
      }
    } catch {
      Alert.alert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }

  async function saveMachines(nextMachines: Machine[]) {
    try {
      await AsyncStorage.setItem(machinesStorageKey, JSON.stringify(nextMachines));
      setMachines(nextMachines);
      return true;
    } catch {
      Alert.alert(strings.alerts.storageSaveTitle, strings.alerts.storageSaveMessage);
      return false;
    }
  }

  function openAddMachineForm() {
    setEditingMachineId(null);
    setMachineDraft(emptyMachineDraft);
    setMachineNameError('');
    setScreen('machineForm');
  }

  function openEditMachineForm(machine: Machine) {
    setEditingMachineId(machine.id);
    setMachineDraft({
      name: machine.name,
      muscleGroup: machine.muscleGroup,
      note: machine.note,
    });
    setMachineNameError('');
    setScreen('machineForm');
  }

  function closeMachineForm() {
    setScreen('home');
    setEditingMachineId(null);
    setMachineDraft(emptyMachineDraft);
    setMachineNameError('');
  }

  function updateMachineDraft(field: keyof MachineDraft, value: string) {
    setMachineDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    if (field === 'name' && value.trim().length > 0) {
      setMachineNameError('');
    }
  }

  async function saveMachine() {
    const nextDraft: MachineDraft = {
      name: machineDraft.name.trim(),
      muscleGroup: machineDraft.muscleGroup.trim(),
      note: machineDraft.note.trim(),
    };

    if (nextDraft.name.length === 0) {
      setMachineNameError(strings.forms.machine.errors.nameRequired);
      return;
    }

    if (editingMachineId === null) {
      const didSave = await saveMachines([
        ...machines,
        {
          id: String(Date.now()),
          ...nextDraft,
        },
      ]);

      if (!didSave) {
        return;
      }
    } else {
      const didSave = await saveMachines(
        machines.map((machine) =>
          machine.id === editingMachineId
            ? {
                id: machine.id,
                ...nextDraft,
              }
            : machine,
        ),
      );

      if (!didSave) {
        return;
      }
    }

    closeMachineForm();
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
            void saveMachines(
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
        <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.secondaryHeader}>
              <Pressable
                accessibilityLabel={strings.accessibility.back}
                onPress={closeMachineForm}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons name="arrow-back" size={22} color={colors.text} />
              </Pressable>
              <Text style={styles.secondaryTitle}>
                {isEditingMachine
                  ? strings.forms.machine.editTitle
                  : strings.forms.machine.addTitle}
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{strings.forms.machine.nameLabel}</Text>
              <TextInput
                accessibilityLabel={strings.forms.machine.nameLabel}
                autoFocus
                onChangeText={(value) => updateMachineDraft('name', value)}
                placeholder={strings.forms.machine.namePlaceholder}
                placeholderTextColor={colors.muted}
                style={[
                  styles.formInput,
                  machineNameError.length > 0 && styles.inputError,
                ]}
                value={machineDraft.name}
              />
              {machineNameError.length > 0 ? (
                <Text style={styles.errorText}>{machineNameError}</Text>
              ) : null}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{strings.forms.machine.muscleGroupLabel}</Text>
              <TextInput
                accessibilityLabel={strings.forms.machine.muscleGroupLabel}
                onChangeText={(value) => updateMachineDraft('muscleGroup', value)}
                placeholder={strings.forms.machine.muscleGroupPlaceholder}
                placeholderTextColor={colors.muted}
                style={styles.formInput}
                value={machineDraft.muscleGroup}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>{strings.forms.machine.noteLabel}</Text>
              <TextInput
                accessibilityLabel={strings.forms.machine.noteLabel}
                multiline
                onChangeText={(value) => updateMachineDraft('note', value)}
                placeholder={strings.forms.machine.notePlaceholder}
                placeholderTextColor={colors.muted}
                style={[styles.formInput, styles.noteInput]}
                textAlignVertical="top"
                value={machineDraft.note}
              />
            </View>

            <Pressable
              accessibilityLabel={strings.accessibility.saveMachine}
              onPress={() => {
                void saveMachine();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text style={styles.saveButtonText}>{strings.actions.save}</Text>
            </Pressable>
          </ScrollView>
          <StatusBar style="dark" />
        </SafeAreaView>
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
                onPress={() => {
                  setActiveTab(tab.key);
                  setSearchText('');
                }}
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

        <View style={styles.content}>
          <View style={styles.toolbar}>
            <TextInput
              accessibilityLabel={strings.accessibility.search}
              onChangeText={setSearchText}
              placeholder={selectedTab.searchPlaceholder}
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              value={searchText}
            />
            {searchText.length > 0 ? (
              <Pressable
                accessibilityLabel={strings.accessibility.clearSearch}
                onPress={() => setSearchText('')}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            ) : null}
            {activeTab === 'machines' ? (
              <Pressable
                accessibilityLabel={strings.accessibility.addMachine}
                onPress={openAddMachineForm}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons name="add" size={26} color={colors.panel} />
              </Pressable>
            ) : null}
          </View>

          {activeTab === 'machines' ? (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={filteredMachines}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <EmptyState
                  message={
                    machines.length === 0
                      ? strings.empty.machines.message
                      : strings.empty.filtered.message
                  }
                  onReset={machines.length > 0 ? () => setSearchText('') : undefined}
                  resetLabel={strings.actions.resetSearch}
                  title={
                    machines.length === 0
                      ? strings.empty.machines.title
                      : strings.empty.filtered.title
                  }
                />
              }
              renderItem={({ item }) => (
                <MachineCard
                  machine={item}
                  onDelete={() => confirmDeleteMachine(item)}
                  onEdit={() => openEditMachineForm(item)}
                />
              )}
              style={styles.list}
            />
          ) : (
            <FlatList
              contentContainerStyle={styles.listContent}
              data={[]}
              keyExtractor={(item: string) => item}
              ListEmptyComponent={
                <EmptyState
                  message={selectedTab.emptyMessage}
                  title={selectedTab.emptyTitle}
                />
              }
              renderItem={({ item }: { item: string }) => (
                <Text style={styles.listItem}>{item}</Text>
              )}
              style={styles.list}
            />
          )}
        </View>

        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function MachineCard({
  machine,
  onDelete,
  onEdit,
}: {
  machine: Machine;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={strings.accessibility.editMachine}
      onPress={onEdit}
      style={({ pressed }) => [styles.card, pressed && styles.pressedButton]}
    >
      <View style={styles.cardTextBlock}>
        <Text style={styles.cardTitle}>{machine.name}</Text>
        {machine.muscleGroup.length > 0 ? (
          <Text style={styles.cardMeta}>{machine.muscleGroup}</Text>
        ) : null}
        {machine.note.length > 0 ? (
          <Text numberOfLines={2} style={styles.cardNote}>
            {machine.note}
          </Text>
        ) : null}
      </View>
      <View style={styles.cardActions}>
        <Pressable
          accessibilityLabel={strings.accessibility.editMachine}
          onPress={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          style={({ pressed }) => [
            styles.cardActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="pencil" size={19} color={colors.text} />
        </Pressable>
        <Pressable
          accessibilityLabel={strings.accessibility.deleteMachine}
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          style={({ pressed }) => [
            styles.cardActionButton,
            styles.destructiveActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="trash-outline" size={19} color={colors.destructive} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function EmptyState({
  message,
  onReset,
  resetLabel,
  title,
}: {
  message: string;
  onReset?: () => void;
  resetLabel?: string;
  title: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {onReset !== undefined && resetLabel !== undefined ? (
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.resetButtonText}>{resetLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function isMachineList(value: unknown): value is Machine[] {
  return Array.isArray(value) && value.every(isMachine);
}

function isMachine(value: unknown): value is Machine {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const machine = value as Record<string, unknown>;

  return (
    typeof machine.id === 'string' &&
    typeof machine.name === 'string' &&
    typeof machine.muscleGroup === 'string' &&
    typeof machine.note === 'string'
  );
}

const colors = {
  background: '#F7F8FA',
  panel: '#FFFFFF',
  text: '#17212B',
  muted: '#6B7280',
  border: '#D7DEE8',
  active: '#E5F2ED',
  activeText: '#0D5C46',
  primary: '#0D5C46',
  destructive: '#B42318',
  errorBackground: '#FEF3F2',
};

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    height: 44,
    paddingHorizontal: 14,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 24,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  cardNote: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 5,
  },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cardActionButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  destructiveActionButton: {
    backgroundColor: colors.errorBackground,
    borderColor: '#FECACA',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  resetButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 42,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  listItem: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  formContent: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
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
  formField: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  noteInput: {
    minHeight: 104,
    paddingTop: 12,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '700',
  },
});
