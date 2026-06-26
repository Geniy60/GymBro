import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine } from '../../types';
import { MachineCard } from './MachineCard';

type MachinesScreenProps = {
  machines: Machine[];
  onAddMachine: () => void;
  onDeleteMachine: (machine: Machine) => void;
  onEditMachine: (machine: Machine) => void;
};

export function MachinesScreen({
  machines,
  onAddMachine,
  onDeleteMachine,
  onEditMachine,
}: MachinesScreenProps) {
  const [searchText, setSearchText] = useState('');

  const filteredMachines = useMemo(() => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase();

    if (normalizedSearch.length === 0) {
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

      return searchableText.includes(normalizedSearch);
    });
  }, [machines, searchText]);

  return (
    <View style={styles.content}>
      <View style={styles.toolbar}>
        <TextInput
          accessibilityLabel={strings.accessibility.search}
          onChangeText={setSearchText}
          placeholder={strings.search.machines}
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
        <Pressable
          accessibilityLabel={strings.accessibility.addMachine}
          onPress={onAddMachine}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.addButtonText}>{strings.actions.addIcon}</Text>
        </Pressable>
      </View>

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
            onDelete={() => onDeleteMachine(item)}
            onEdit={() => onEditMachine(item)}
          />
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  addButtonText: {
    color: colors.panel,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 24,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
