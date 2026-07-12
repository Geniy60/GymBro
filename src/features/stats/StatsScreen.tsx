import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BackHandler, StyleSheet, View } from 'react-native';

import { showAppAlert } from '../../appAlert';
import { ListLoadingState } from '../../components/ListLoadingState';
import { queryKeys } from '../../queryClient';
import {
  loadCardioHistory,
  loadMachineHistory,
  loadWorkoutStats,
} from '../../services/workoutStatsService';
import { strings } from '../../strings';
import type {
  ExerciseHistorySummary,
  MachineHistoryItem,
  WorkoutStats,
} from '../../types';
import { MachineHistoryScreen } from './MachineHistoryScreen';
import { StatsOverview } from './StatsOverview';

type StatsScreenProps = {
  userId: string | null;
};

const emptyStats: WorkoutStats = {
  exerciseHistoryItems: [],
  monthStats: [],
  monthWorkoutCount: 0,
  totalWorkouts: 0,
};

export function StatsScreen({ userId }: StatsScreenProps) {
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<ExerciseHistorySummary | null>(null);
  const statsQuery = useQuery({
    enabled: userId !== null,
    queryFn: () => loadWorkoutStats(userId ?? ''),
    queryKey: queryKeys.workoutStats(userId ?? 'none'),
  });
  const historyQuery = useQuery({
    enabled:
      userId !== null && selectedHistoryItem?.trackingType === 'strength',
    queryFn: () =>
      loadMachineHistory({
        machineId: selectedHistoryItem?.id ?? '',
        userId: userId ?? '',
      }),
    queryKey:
      userId === null || selectedHistoryItem?.trackingType !== 'strength'
        ? queryKeys.machineHistory('none', 'none')
        : queryKeys.machineHistory(userId, selectedHistoryItem.id),
  });
  const cardioHistoryQuery = useQuery({
    enabled: userId !== null && selectedHistoryItem?.trackingType === 'cardio',
    queryFn: () =>
      loadCardioHistory({
        machineId: selectedHistoryItem?.id ?? '',
        userId: userId ?? '',
      }),
    queryKey:
      userId === null || selectedHistoryItem?.trackingType !== 'cardio'
        ? queryKeys.cardioHistory('none', 'none')
        : queryKeys.cardioHistory(userId, selectedHistoryItem.id),
  });
  const stats = statsQuery.data ?? emptyStats;
  const maxMonthCount = Math.max(
    ...stats.monthStats.map((monthStat) => monthStat.count),
    1,
  );

  useEffect(() => {
    if (selectedHistoryItem === null) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedHistoryItem(null);
      return true;
    });

    return () => subscription.remove();
  }, [selectedHistoryItem]);

  useEffect(() => {
    if (statsQuery.isError || historyQuery.isError || cardioHistoryQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [cardioHistoryQuery.isError, historyQuery.isError, statsQuery.isError]);

  if (selectedHistoryItem?.trackingType === 'cardio') {
    const selectedCardioHistory = cardioHistoryQuery.data ?? [];
    const isLoadingHistory =
      selectedCardioHistory.length === 0 && cardioHistoryQuery.isFetching;

    return (
      <MachineHistoryScreen
        cardioHistoryItems={selectedCardioHistory}
        historyItems={[]}
        isLoadingHistory={isLoadingHistory}
        mode="cardio"
        onBack={() => setSelectedHistoryItem(null)}
        selectedItem={selectedHistoryItem}
      />
    );
  }

  if (selectedHistoryItem?.trackingType === 'strength') {
    const selectedMachineHistory = historyQuery.data ?? [];
    const isLoadingHistory =
      selectedMachineHistory.length === 0 && historyQuery.isFetching;
    const selectedMachineMax = getMachineHistoryMax(selectedMachineHistory);

    return (
      <MachineHistoryScreen
        historyItems={selectedMachineHistory}
        isLoadingHistory={isLoadingHistory}
        maxDateLabel={selectedMachineMax?.dateLabel}
        maxWeightKg={selectedMachineMax?.maxWeightKg ?? undefined}
        mode="strength"
        onBack={() => setSelectedHistoryItem(null)}
        selectedItem={selectedHistoryItem}
        userId={userId ?? ''}
      />
    );
  }

  if (statsQuery.isLoading && statsQuery.data === undefined) {
    return (
      <View style={styles.content}>
        <ListLoadingState rowCount={5} />
      </View>
    );
  }

  return (
    <StatsOverview
      maxMonthCount={maxMonthCount}
      onSelectHistoryItem={setSelectedHistoryItem}
      stats={stats}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
});

function getMachineHistoryMax(
  historyItems: MachineHistoryItem[],
): MachineHistoryItem | null {
  let maxItem: MachineHistoryItem | null = null;

  for (const historyItem of historyItems) {
    if (historyItem.maxWeightKg === null) {
      continue;
    }

    if (
      maxItem === null ||
      maxItem.maxWeightKg === null ||
      historyItem.maxWeightKg > maxItem.maxWeightKg
    ) {
      maxItem = historyItem;
    }
  }

  return maxItem;
}
