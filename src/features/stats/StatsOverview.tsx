import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { CardioSummary, MachineMax, WorkoutStats } from '../../types';
import {
  formatCardioDistance,
  formatCardioDuration,
  formatCardioElevation,
  formatWeight,
} from './statsFormat';

type StatsOverviewProps = {
  maxMonthCount: number;
  onSelectCardio: (cardio: CardioSummary) => void;
  onSelectMachine: (machine: MachineMax) => void;
  stats: WorkoutStats;
};

export function StatsOverview({
  maxMonthCount,
  onSelectCardio,
  onSelectMachine,
  stats,
}: StatsOverviewProps) {
  const latestCardio = stats.latestCardio;

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{strings.stats.cardioTitle}</Text>
        {latestCardio === null ? (
          <Text style={styles.emptyText}>{strings.stats.cardioEmpty}</Text>
        ) : (
          <Pressable
            onPress={() => onSelectCardio(latestCardio)}
            style={({ pressed }) => [
              styles.maxRow,
              pressed && styles.pressedButton,
            ]}
          >
            <Text numberOfLines={1} style={styles.maxMachineName}>
              {latestCardio.machineName}
            </Text>
            <Text style={styles.maxValue}>
              {formatCardioValue(latestCardio)} · {latestCardio.dateLabel}
            </Text>
          </Pressable>
        )}
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
              onPress={() => onSelectMachine(item)}
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

function formatCardioValue(cardio: CardioSummary): string {
  return strings.stats.cardioValue(
    formatCardioDistance(cardio.distanceKm),
    formatCardioElevation(cardio.elevationMeters),
    formatCardioDuration(cardio.durationSeconds),
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

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
