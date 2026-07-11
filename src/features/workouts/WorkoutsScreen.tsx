import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { showAppAlert } from '../../appAlert';
import { EmptyState } from '../../components/EmptyState';
import { ListLoadingState } from '../../components/ListLoadingState';
import { SearchInput } from '../../components/SearchInput';
import { queryKeys } from '../../queryClient';
import { loadWorkoutSummaries } from '../../services/workoutsService';
import { strings } from '../../strings';
import { useAppStyles, useAppTheme } from '../../ThemeProvider';
import type { AppThemeColors } from '../../theme/colors';
import type { WorkoutPage, WorkoutSummary } from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';
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
      workout: WorkoutSummary;
    };

type WorkoutsScreenProps = {
  onStartWorkout: () => void;
  onDeleteWorkout: (workout: WorkoutSummary) => void;
  onEditWorkout: (workout: WorkoutSummary) => void;
  onRepeatWorkout: (workout: WorkoutSummary) => void;
  userId: string | null;
};

export function WorkoutsScreen({
  onDeleteWorkout,
  onEditWorkout,
  onRepeatWorkout,
  onStartWorkout,
  userId,
}: WorkoutsScreenProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const keyboardBottomInset = useKeyboardBottomInset();
  const trimmedSearchText = debouncedSearchText.trim();
  const workoutSummariesQuery = useInfiniteQuery({
    enabled: userId !== null,
    getNextPageParam: (lastPage: WorkoutPage) => lastPage.nextOffset,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      loadWorkoutSummaries({
        offset: pageParam,
        searchText: trimmedSearchText,
        userId: userId ?? '',
      }),
    queryKey:
      userId === null
        ? queryKeys.workoutSummaries('none', trimmedSearchText)
        : queryKeys.workoutSummaries(userId, trimmedSearchText),
  });
  const workouts = useMemo(
    () =>
      workoutSummariesQuery.data?.pages.flatMap((page: WorkoutPage) => page.items) ??
      [],
    [workoutSummariesQuery.data],
  );
  const workoutListItems = useMemo(
    () => createWorkoutListItems(workouts),
    [workouts],
  );
  const hasSearch = trimmedSearchText.length > 0;
  const isWaitingForWorkouts =
    workouts.length === 0 &&
    (searchText.trim() !== trimmedSearchText || workoutSummariesQuery.isFetching);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  useEffect(() => {
    if (workoutSummariesQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [workoutSummariesQuery.isError]);

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
        contentContainerStyle={[
          styles.listContent,
          keyboardBottomInset > 0 && { paddingBottom: 88 + keyboardBottomInset },
        ]}
        data={workoutListItems}
        keyboardDismissMode="on-drag"
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isWaitingForWorkouts ? (
            <ListLoadingState />
          ) : (
            <EmptyState
              message={
                !hasSearch
                  ? strings.empty.workouts.message
                  : strings.empty.filtered.message
              }
              onReset={hasSearch ? () => setSearchText('') : undefined}
              resetLabel={strings.actions.resetSearch}
              title={
                !hasSearch
                  ? strings.empty.workouts.title
                  : strings.empty.filtered.title
              }
            />
          )
        }
        ListFooterComponent={
          workoutSummariesQuery.isFetchingNextPage ? (
            <Text style={styles.footerText}>{strings.workouts.loadingMore}</Text>
          ) : null
        }
        onEndReached={() => {
          if (
            workoutSummariesQuery.hasNextPage &&
            !workoutSummariesQuery.isFetchingNextPage
          ) {
            void workoutSummariesQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.6}
        renderItem={({ item }) =>
          item.type === 'month' ? (
            <View style={styles.monthDivider}>
              <Text style={styles.monthDividerText}>{item.title}</Text>
            </View>
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
        <Ionicons color={colors.panel} name="barbell-outline" size={20} />
        <Text style={styles.startWorkoutButtonText}>
          {strings.workouts.startWorkout}
        </Text>
      </Pressable>
    </View>
  );
}

function createWorkoutListItems(workouts: WorkoutSummary[]): WorkoutListItem[] {
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
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 88,
  },
  monthDivider: {
    alignSelf: 'flex-start',
    backgroundColor: colors.active,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthDividerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  footerText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 8,
    textAlign: 'center',
  },
  startWorkoutButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    bottom: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    left: 20,
    minHeight: 50,
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
}
