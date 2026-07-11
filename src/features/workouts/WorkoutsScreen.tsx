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

type WorkoutMonthGroup = {
  id: string;
  title: string;
  workouts: WorkoutSummary[];
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
        renderItem={({ item }) => (
          <View style={styles.monthSection}>
            <Text style={styles.monthTitle}>{item.title}</Text>
            <View style={styles.monthGroup}>
              {item.workouts.map((workout, index) => (
                <WorkoutCard
                  key={workout.id}
                  isFirstInGroup={index === 0}
                  onDelete={() => onDeleteWorkout(workout)}
                  onEdit={() => onEditWorkout(workout)}
                  onRepeat={() => onRepeatWorkout(workout)}
                  workout={workout}
                />
              ))}
            </View>
          </View>
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
        <Ionicons color={colors.panel} name="barbell-outline" size={20} />
        <Text style={styles.startWorkoutButtonText}>
          {strings.workouts.startWorkout}
        </Text>
      </Pressable>
    </View>
  );
}

function createWorkoutListItems(workouts: WorkoutSummary[]): WorkoutMonthGroup[] {
  const listItems: WorkoutMonthGroup[] = [];
  let currentMonthKey = '';
  let currentGroup: WorkoutMonthGroup | null = null;

  for (const workout of workouts) {
    const date = new Date(workout.startedAt);
    const monthKey = formatWorkoutMonthKey(date, workout.startedAt);

    if (monthKey !== currentMonthKey) {
      currentMonthKey = monthKey;
      currentGroup = {
        id: `month-${monthKey}`,
        title: formatWorkoutMonthTitle(date),
        workouts: [],
      };
      listItems.push(currentGroup);
    }

    currentGroup?.workouts.push(workout);
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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flex: 1,
    marginTop: 2,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 88,
    paddingTop: 10,
  },
  monthSection: {
    marginBottom: 14,
  },
  monthTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    paddingHorizontal: 2,
    textTransform: 'uppercase',
  },
  monthGroup: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
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
