import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Workout } from '../../types';
import { WorkoutCard } from './WorkoutCard';

type WorkoutsScreenProps = {
  onStartWorkout: () => void;
  onDeleteWorkout: (workout: Workout) => void;
  onEditWorkout: (workout: Workout) => void;
  workouts: Workout[];
};

export function WorkoutsScreen({
  onDeleteWorkout,
  onEditWorkout,
  onStartWorkout,
  workouts,
}: WorkoutsScreenProps) {
  const [searchText, setSearchText] = useState('');

  const filteredWorkouts = useMemo(() => {
    const normalizedSearch = searchText.trim().toLocaleLowerCase();

    if (normalizedSearch.length === 0) {
      return workouts;
    }

    return workouts.filter((workout) => {
      const searchableText = [
        workout.name,
        ...workout.exercises.map((exercise) => exercise.machineName),
      ].join(' ').toLocaleLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [searchText, workouts]);

  return (
    <View style={styles.content}>
      <View style={styles.toolbar}>
        <TextInput
          accessibilityLabel={strings.accessibility.search}
          onChangeText={setSearchText}
          placeholder={strings.search.workouts}
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
          accessibilityLabel={strings.accessibility.addWorkout}
          onPress={onStartWorkout}
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
        data={filteredWorkouts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <EmptyState
            message={
              workouts.length === 0
                ? strings.empty.workouts.message
                : strings.empty.filtered.message
            }
            onReset={workouts.length > 0 ? () => setSearchText('') : undefined}
            resetLabel={strings.actions.resetSearch}
            title={
              workouts.length === 0
                ? strings.empty.workouts.title
                : strings.empty.filtered.title
            }
          />
        }
        renderItem={({ item }) => (
          <WorkoutCard
            onDelete={() => onDeleteWorkout(item)}
            onEdit={() => onEditWorkout(item)}
            workout={item}
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
