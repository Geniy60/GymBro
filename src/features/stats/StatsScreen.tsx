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
import type { CardioSummary, MachineMax, WorkoutStats } from '../../types';
import { MachineHistoryScreen } from './MachineHistoryScreen';
import { StatsOverview } from './StatsOverview';

type StatsScreenProps = {
  userId: string | null;
};

const emptyStats: WorkoutStats = {
  latestCardio: null,
  machineMaxes: [],
  monthStats: [],
  monthWorkoutCount: 0,
  totalWorkouts: 0,
};

export function StatsScreen({ userId }: StatsScreenProps) {
  const [selectedCardio, setSelectedCardio] = useState<CardioSummary | null>(null);
  const [selectedMachine, setSelectedMachine] = useState<MachineMax | null>(null);
  const statsQuery = useQuery({
    enabled: userId !== null,
    queryFn: () => loadWorkoutStats(userId ?? ''),
    queryKey: queryKeys.workoutStats(userId ?? 'none'),
  });
  const historyQuery = useQuery({
    enabled: userId !== null && selectedMachine !== null,
    queryFn: () =>
      loadMachineHistory({
        machineId: selectedMachine?.id ?? '',
        userId: userId ?? '',
      }),
    queryKey:
      userId === null || selectedMachine === null
        ? queryKeys.machineHistory('none', 'none')
        : queryKeys.machineHistory(userId, selectedMachine.id),
  });
  const cardioHistoryQuery = useQuery({
    enabled: userId !== null && selectedCardio !== null,
    queryFn: () =>
      loadCardioHistory({
        machineId: selectedCardio?.id ?? '',
        userId: userId ?? '',
      }),
    queryKey:
      userId === null || selectedCardio === null
        ? queryKeys.cardioHistory('none', 'none')
        : queryKeys.cardioHistory(userId, selectedCardio.id),
  });
  const stats = statsQuery.data ?? emptyStats;
  const maxMonthCount = Math.max(
    ...stats.monthStats.map((monthStat) => monthStat.count),
    1,
  );

  useEffect(() => {
    if (selectedMachine === null && selectedCardio === null) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedCardio(null);
      setSelectedMachine(null);
      return true;
    });

    return () => subscription.remove();
  }, [selectedCardio, selectedMachine]);

  useEffect(() => {
    if (statsQuery.isError || historyQuery.isError || cardioHistoryQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [cardioHistoryQuery.isError, historyQuery.isError, statsQuery.isError]);

  if (selectedCardio !== null) {
    const selectedCardioHistory = cardioHistoryQuery.data ?? [];
    const isLoadingHistory =
      selectedCardioHistory.length === 0 && cardioHistoryQuery.isFetching;

    return (
      <MachineHistoryScreen
        cardioHistoryItems={selectedCardioHistory}
        historyItems={[]}
        isLoadingHistory={isLoadingHistory}
        mode="cardio"
        onBack={() => setSelectedCardio(null)}
        selectedItem={selectedCardio}
      />
    );
  }

  if (selectedMachine !== null) {
    const selectedMachineHistory = historyQuery.data ?? [];
    const isLoadingHistory =
      selectedMachineHistory.length === 0 && historyQuery.isFetching;

    return (
      <MachineHistoryScreen
        historyItems={selectedMachineHistory}
        isLoadingHistory={isLoadingHistory}
        mode="strength"
        onBack={() => setSelectedMachine(null)}
        selectedItem={selectedMachine}
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
      onSelectCardio={setSelectedCardio}
      onSelectMachine={setSelectedMachine}
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
