import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { SearchInput } from '../../components/SearchInput';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Workout } from '../../types';
import { WorkoutCard } from './WorkoutCard';

type WorkoutsScreenProps = {
  onStartWorkout: () => void;
  onDeleteWorkout: (workout: Workout) => void;
  onEditWorkout: (workout: Workout) => void;
  onRepeatWorkout: (workout: Workout) => void;
  workouts: Workout[];
};

export function WorkoutsScreen({
  onDeleteWorkout,
  onEditWorkout,
  onRepeatWorkout,
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
        new Date(workout.startedAt).toLocaleDateString('ru-RU'),
        ...workout.exercises.map((exercise) => exercise.machineName),
      ].join(' ').toLocaleLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [searchText, workouts]);

  return (
    <View style={styles.content}>
      <View style={styles.toolbar}>
        <SearchInput
          onChangeText={setSearchText}
          placeholder={strings.search.workouts}
          value={searchText}
        />
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
            onRepeat={() => onRepeatWorkout(item)}
            workout={item}
          />
        )}
        style={styles.list}
      />

      <Pressable
        accessibilityLabel={strings.accessibility.startWorkout}
        onPress={onStartWorkout}
        style={({ pressed }) => [
          styles.startWorkoutButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Text style={styles.startWorkoutButtonText}>
          {strings.workouts.startWorkout}
        </Text>
      </Pressable>
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
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 88,
  },
  startWorkoutButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    bottom: 12,
    justifyContent: 'center',
    left: 20,
    minHeight: 48,
    position: 'absolute',
    right: 20,
  },
  startWorkoutButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
