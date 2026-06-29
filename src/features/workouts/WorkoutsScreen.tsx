import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { SearchInput } from '../../components/SearchInput';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Workout } from '../../types';
import { WorkoutCard } from './WorkoutCard';

type WorkoutListItem =
  | {
      id: string;
      title: string;
      type: 'month';
    }
  | {
      id: string;
      type: 'workout';
      workout: Workout;
    };

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
  const workoutListItems = useMemo(
    () => createWorkoutListItems(filteredWorkouts),
    [filteredWorkouts],
  );

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
        data={workoutListItems}
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
        renderItem={({ item }) =>
          item.type === 'month' ? (
            <Text style={styles.monthDivider}>{item.title}</Text>
          ) : (
            <WorkoutCard
              onDelete={() => onDeleteWorkout(item.workout)}
              onEdit={() => onEditWorkout(item.workout)}
              onRepeat={() => onRepeatWorkout(item.workout)}
              workout={item.workout}
            />
          )
        }
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

function createWorkoutListItems(workouts: Workout[]): WorkoutListItem[] {
  const listItems: WorkoutListItem[] = [];
  let currentMonthKey = '';

  for (const workout of workouts) {
    const date = new Date(workout.startedAt);
    const monthKey = formatWorkoutMonthKey(date, workout.startedAt);

    if (monthKey !== currentMonthKey) {
      currentMonthKey = monthKey;
      listItems.push({
        id: `month-${monthKey}`,
        title: formatWorkoutMonthTitle(date),
        type: 'month',
      });
    }

    listItems.push({
      id: `workout-${workout.id}`,
      type: 'workout',
      workout,
    });
  }

  return listItems;
}

function formatWorkoutMonthKey(date: Date, fallback: string): string {
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return `${date.getFullYear()}-${date.getMonth()}`;
}

function formatWorkoutMonthTitle(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return strings.workouts.unknownMonth;
  }

  const month = date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  return month.charAt(0).toLocaleUpperCase('ru-RU') + month.slice(1);
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
  monthDivider: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
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
