import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { BackHandler, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Workout } from '../../types';

type StatsScreenProps = {
  workouts: Workout[];
};

type MonthStat = {
  count: number;
  key: string;
  label: string;
};

type MachineMax = {
  dateLabel: string;
  id: string;
  machineName: string;
  weightKg: number;
  workoutTime: number;
};

type MachineHistoryItem = {
  dateLabel: string;
  id: string;
  maxWeightKg: number | null;
  setCount: number;
  workoutTime: number;
};

export function StatsScreen({ workouts }: StatsScreenProps) {
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const totalWorkouts = workouts.length;
  const monthWorkoutCount = countCurrentMonthWorkouts(workouts);
  const monthStats = getLastSixMonthStats(workouts);
  const maxMonthCount = Math.max(...monthStats.map((monthStat) => monthStat.count), 1);
  const machineMaxes = getMachineMaxes(workouts);
  const selectedMachine = machineMaxes.find(
    (machineMax) => machineMax.id === selectedMachineId,
  );
  const selectedMachineHistory =
    selectedMachine === undefined
      ? []
      : getMachineHistory(workouts, selectedMachine.id);

  useEffect(() => {
    if (selectedMachineId === null) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setSelectedMachineId(null);
      return true;
    });

    return () => subscription.remove();
  }, [selectedMachineId]);

  if (selectedMachine !== undefined) {
    return (
      <View style={styles.content}>
        <View style={styles.detailHeader}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={() => setSelectedMachineId(null)}
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
          renderItem={({ item }) => (
            <View style={styles.historyRow}>
              <View style={styles.historyTextBlock}>
                <Text style={styles.historyDate}>{item.dateLabel}</Text>
                <Text style={styles.historyMeta}>
                  {strings.stats.historySetCount(item.setCount)}
                </Text>
              </View>
              <Text style={styles.historyMax}>
                {item.maxWeightKg === null
                  ? strings.stats.noWeight
                  : strings.stats.workoutMax(formatWeight(item.maxWeightKg))}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <View style={styles.summaryRow}>
        <StatTile label={strings.stats.totalWorkouts} value={String(totalWorkouts)} />
        <StatTile
          label={strings.stats.monthWorkouts}
          value={String(monthWorkoutCount)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.stats.chartTitle}</Text>
        <View style={styles.chartRow}>
          {monthStats.map((monthStat) => (
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
          data={machineMaxes}
          keyExtractor={(machineMax) => machineMax.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{strings.stats.emptyMaxes}</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedMachineId(item.id)}
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

function countCurrentMonthWorkouts(workouts: Workout[]): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return workouts.filter((workout) => {
    const workoutDate = new Date(workout.startedAt);

    return (
      !Number.isNaN(workoutDate.getTime()) &&
      workoutDate.getMonth() === currentMonth &&
      workoutDate.getFullYear() === currentYear
    );
  }).length;
}

function getLastSixMonthStats(workouts: Workout[]): MonthStat[] {
  const monthStarts = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (5 - index));

    return date;
  });

  return monthStarts.map((monthStart) => {
    const month = monthStart.getMonth();
    const year = monthStart.getFullYear();

    return {
      count: workouts.filter((workout) => {
        const workoutDate = new Date(workout.startedAt);

        return (
          !Number.isNaN(workoutDate.getTime()) &&
          workoutDate.getMonth() === month &&
          workoutDate.getFullYear() === year
        );
      }).length,
      key: `${year}-${month}`,
      label: monthStart.toLocaleDateString('ru-RU', { month: 'short' }),
    };
  });
}

function getMachineMaxes(workouts: Workout[]): MachineMax[] {
  const maxesByMachine = new Map<string, MachineMax>();

  for (const workout of workouts) {
    const workoutDate = new Date(workout.startedAt);
    const workoutTime = workoutDate.getTime();
    const dateLabel = Number.isNaN(workoutTime)
      ? strings.workouts.unknownMonth
      : workoutDate.toLocaleDateString('ru-RU');

    for (const exercise of workout.exercises) {
      for (const workoutSet of exercise.sets) {
        const weightKg = parseWeight(workoutSet.weightKg);

        if (weightKg === null) {
          continue;
        }

        const existingMax = maxesByMachine.get(exercise.machineId);
        const shouldReplace =
          existingMax === undefined ||
          weightKg > existingMax.weightKg ||
          (weightKg === existingMax.weightKg && workoutTime > existingMax.workoutTime);

        if (shouldReplace) {
          maxesByMachine.set(exercise.machineId, {
            dateLabel,
            id: exercise.machineId,
            machineName: exercise.machineName,
            weightKg,
            workoutTime,
          });
        }
      }
    }
  }

  return [...maxesByMachine.values()].sort((firstMax, secondMax) =>
    firstMax.machineName.localeCompare(secondMax.machineName, 'ru-RU'),
  );
}

function getMachineHistory(
  workouts: Workout[],
  machineId: string,
): MachineHistoryItem[] {
  return workouts
    .flatMap((workout) => {
      const workoutDate = new Date(workout.startedAt);
      const workoutTime = workoutDate.getTime();
      const dateLabel = Number.isNaN(workoutTime)
        ? strings.workouts.unknownMonth
        : workoutDate.toLocaleDateString('ru-RU');

      return workout.exercises
        .filter((exercise) => exercise.machineId === machineId)
        .map((exercise) => {
          const weights = exercise.sets
            .map((workoutSet) => parseWeight(workoutSet.weightKg))
            .filter((weightKg): weightKg is number => weightKg !== null);

          return {
            dateLabel,
            id: `${workout.id}-${exercise.id}`,
            maxWeightKg: weights.length === 0 ? null : Math.max(...weights),
            setCount: exercise.sets.length,
            workoutTime: Number.isNaN(workoutTime) ? 0 : workoutTime,
          };
        });
    })
    .sort((firstItem, secondItem) => secondItem.workoutTime - firstItem.workoutTime);
}

function parseWeight(weightKg: string): number | null {
  const normalizedWeight = weightKg.trim().replace(',', '.');

  if (normalizedWeight.length === 0) {
    return null;
  }

  const parsedWeight = Number(normalizedWeight);

  return Number.isFinite(parsedWeight) ? parsedWeight : null;
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
    marginBottom: 12,
  },
  statTile: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statValue: {
    color: colors.text,
    fontSize: 26,
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
  historyMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
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
