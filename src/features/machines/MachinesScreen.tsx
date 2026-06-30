import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { ListLoadingState } from '../../components/ListLoadingState';
import { SearchInput } from '../../components/SearchInput';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine } from '../../types';
import { MachineCard } from './MachineCard';

type MachinesScreenProps = {
  isLoading: boolean;
  machines: Machine[];
  onAddMachine: () => void;
  onDeleteMachine: (machine: Machine) => void;
  onEditMachine: (machine: Machine) => void;
};

export function MachinesScreen({
  isLoading,
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
        <SearchInput
          onChangeText={setSearchText}
          placeholder={strings.search.machines}
          value={searchText}
        />
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
          isLoading ? (
            <ListLoadingState />
          ) : (
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
          )
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
