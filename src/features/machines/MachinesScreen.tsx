import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { ListLoadingState } from '../../components/ListLoadingState';
import { MachineTile } from '../../components/MachineTile';
import { SearchInput } from '../../components/SearchInput';
import { strings } from '../../strings';
import { useAppStyles, useAppTheme } from '../../ThemeProvider';
import type { AppThemeColors } from '../../theme/colors';
import type { Machine } from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';

type MachinesScreenProps = {
  isLoading: boolean;
  machines: Machine[];
  onAddMachine: () => void;
  onEditMachine: (machine: Machine) => void;
};

export function MachinesScreen({
  isLoading,
  machines,
  onAddMachine,
  onEditMachine,
}: MachinesScreenProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const [searchText, setSearchText] = useState('');
  const keyboardBottomInset = useKeyboardBottomInset();

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
          <Ionicons color={colors.panel} name="add" size={24} />
        </Pressable>
      </View>

      <FlatList
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[
          styles.listContent,
          keyboardBottomInset > 0 && { paddingBottom: 24 + keyboardBottomInset },
        ]}
        data={filteredMachines}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
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
        numColumns={2}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <MachineTile
              accessibilityLabel={strings.accessibility.editMachine}
              machine={item}
              onPress={() => onEditMachine(item)}
            />
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
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
  gridItem: {
    flex: 1,
    maxWidth: '48.5%',
  },
  gridRow: {
    gap: 10,
  },
  pressedButton: {
    opacity: 0.7,
  },
  });
}
