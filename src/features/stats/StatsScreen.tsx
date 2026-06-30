import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BackHandler, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { showAppAlert } from '../../appAlert';
import { queryKeys } from '../../queryClient';
import {
  loadMachineHistory,
  loadWorkoutStats,
} from '../../services/workoutsService';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { MachineHistoryItem, MachineMax } from '../../types';

type StatsScreenProps = {
  userId: string | null;
};

export function StatsScreen({ userId }: StatsScreenProps) {
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
  const stats = statsQuery.data ?? {
    machineMaxes: [],
    monthStats: [],
    monthWorkoutCount: 0,
    totalWorkouts: 0,
  };
  const maxMonthCount = Math.max(
    ...stats.monthStats.map((monthStat) => monthStat.count),
    1,
  );

  useEffect(() => {
    if (selectedMachine === null) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedMachine(null);
      return true;
    });

    return () => subscription.remove();
  }, [selectedMachine]);

  useEffect(() => {
    if (statsQuery.isError || historyQuery.isError) {
      showAppAlert(strings.alerts.storageLoadTitle, strings.alerts.storageLoadMessage);
    }
  }, [historyQuery.isError, statsQuery.isError]);

  if (selectedMachine !== null) {
    const selectedMachineHistory = historyQuery.data ?? [];

    return (
      <View style={styles.content}>
        <View style={styles.detailHeader}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={() => setSelectedMachine(null)}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.detailTitleBlock}>
            <Text style={styles.detailTitle}>{selectedMachine.machineName}</Text>
            <Text style={styles.detailSubtitle}>{strings.stats.historyTitle}</Text>
          </View>
        </View>

        <FlatList
          contentContainerStyle={styles.historyListContent}
          data={selectedMachineHistory}
          keyExtractor={(historyItem) => historyItem.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{strings.stats.historyEmpty}</Text>
          }
          renderItem={({ item }) => <MachineHistoryRow item={item} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <View style={styles.summaryRow}>
        <StatTile
          label={strings.stats.totalWorkouts}
          value={String(stats.totalWorkouts)}
        />
        <StatTile
          label={strings.stats.monthWorkouts}
          value={String(stats.monthWorkoutCount)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.stats.chartTitle}</Text>
        <View style={styles.chartRow}>
          {stats.monthStats.map((monthStat) => (
            <View key={monthStat.key} style={styles.chartItem}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${Math.max((monthStat.count / maxMonthCount) * 100, 6)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartValue}>{monthStat.count}</Text>
              <Text style={styles.chartLabel}>{monthStat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.maxesSection]}>
        <Text style={styles.sectionTitle}>{strings.stats.maxesTitle}</Text>
        <FlatList
          contentContainerStyle={styles.maxesListContent}
          data={stats.machineMaxes}
          keyExtractor={(machineMax) => machineMax.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{strings.stats.emptyMaxes}</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedMachine(item)}
              style={({ pressed }) => [
                styles.maxRow,
                pressed && styles.pressedButton,
              ]}
            >
              <Text numberOfLines={1} style={styles.maxMachineName}>
                {item.machineName}
              </Text>
              <Text style={styles.maxValue}>
                {strings.stats.maxWeight(formatWeight(item.weightKg), item.dateLabel)}
              </Text>
            </Pressable>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MachineHistoryRow({ item }: { item: MachineHistoryItem }) {
  return (
    <View style={styles.historyRow}>
      <View style={styles.historyTextBlock}>
        <Text style={styles.historyDate}>{item.dateLabel}</Text>
      </View>
      <Text style={styles.historyMax}>
        {item.maxWeightKg === null
          ? strings.stats.noWeight
          : strings.stats.workoutMax(formatWeight(item.maxWeightKg))}
      </Text>
    </View>
  );
}

function formatWeight(weightKg: number): string {
  return Number.isInteger(weightKg)
    ? String(weightKg)
    : weightKg.toFixed(2).replace(/\.?0+$/, '');
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    width: 37,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailTitleBlock: {
    flex: 1,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  detailSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  statTile: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  maxesSection: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  chartRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 120,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarTrack: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  chartBar: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    minHeight: 4,
    width: '70%',
  },
  chartValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  chartLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  maxesListContent: {
    gap: 8,
    paddingBottom: 4,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  historyListContent: {
    gap: 8,
    paddingBottom: 24,
  },
  historyRow: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  historyTextBlock: {
    flex: 1,
  },
  historyDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  historyMax: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  maxRow: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  maxMachineName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  maxValue: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
