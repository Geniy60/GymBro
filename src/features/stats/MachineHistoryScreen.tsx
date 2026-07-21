import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { ListLoadingState } from '../../components/ListLoadingState';
import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { queryKeys } from '../../queryClient';
import { loadMachineHistorySets } from '../../services/workoutStatsService';
import { strings } from '../../strings';
import { useAppStyles, useAppTheme } from '../../ThemeProvider';
import type { AppThemeColors } from '../../theme/colors';
import type {
  CardioHistoryItem,
  ExerciseHistorySummary,
  MachineHistoryItem,
  MachineHistorySet,
} from '../../types';
import {
  formatCardioDistance,
  formatCardioDuration,
  formatCardioElevation,
  formatWeight,
} from './statsFormat';

type MachineHistoryScreenProps = {
  cardioHistoryItems?: CardioHistoryItem[];
  historyItems: MachineHistoryItem[];
  isLoadingHistory: boolean;
  maxDateLabel?: string;
  maxWeightKg?: number;
  mode: 'cardio' | 'strength';
  onBack: () => void;
  selectedItem: ExerciseHistorySummary;
  userId?: string;
};

export function MachineHistoryScreen({
  cardioHistoryItems = [],
  historyItems,
  isLoadingHistory,
  maxDateLabel,
  maxWeightKg,
  mode,
  onBack,
  selectedItem,
  userId = '',
}: MachineHistoryScreenProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const historyCount =
    mode === 'cardio' ? cardioHistoryItems.length : historyItems.length;
  const [expandedHistoryItemId, setExpandedHistoryItemId] = useState<string | null>(
    null,
  );

  return (
    <View style={styles.content}>
      <SecondaryScreenHeader
        marginBottom={10}
        onBack={onBack}
        title={strings.stats.historyTitle}
      />

      <View style={styles.exerciseSummary}>
        <View style={styles.exerciseSummaryHeader}>
          <View style={styles.exerciseIconBadge}>
            <Ionicons
              name={mode === 'cardio' ? 'walk-outline' : 'barbell-outline'}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.exerciseSummaryText}>
            <Text numberOfLines={2} style={styles.detailTitle}>
              {selectedItem.machineName}
            </Text>
            <Text style={styles.detailSubtitle}>
              {strings.machineTracking[selectedItem.trackingType]}
            </Text>
          </View>
        </View>
        <View style={styles.summaryMetricRow}>
          <SummaryMetric
            label={strings.stats.historyRecordCountTitle}
            value={strings.stats.historyRecordCount(historyCount)}
          />
          {mode === 'strength' && maxWeightKg !== undefined ? (
            <SummaryMetric
              label={strings.stats.strengthHistoryMaxTitle}
              value={strings.stats.maxWeight(
                formatWeight(maxWeightKg),
                maxDateLabel ?? '',
              )}
            />
          ) : null}
        </View>
      </View>

      {mode === 'cardio' ? (
        <FlatList
          contentContainerStyle={styles.historyListContent}
          data={cardioHistoryItems}
          keyExtractor={(historyItem) => historyItem.id}
          ListEmptyComponent={
            isLoadingHistory ? (
              <ListLoadingState rowCount={3} />
            ) : (
              <EmptyState
                message={strings.stats.historyEmpty}
                title={strings.stats.historyTitle}
              />
            )
          }
          renderItem={({ item }) => <CardioHistoryRow item={item} />}
          showsVerticalScrollIndicator={false}
          style={styles.historyList}
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.historyListContent}
          data={historyItems}
          keyExtractor={(historyItem) => historyItem.id}
          ListEmptyComponent={
            isLoadingHistory ? (
              <ListLoadingState rowCount={3} />
            ) : (
              <EmptyState
                message={strings.stats.historyEmpty}
                title={strings.stats.historyTitle}
              />
            )
          }
          renderItem={({ item }) => (
            <MachineHistoryRow
              isExpanded={expandedHistoryItemId === item.id}
              item={item}
              onToggle={() =>
                setExpandedHistoryItemId((currentItemId) =>
                  currentItemId === item.id ? null : item.id,
                )
              }
              userId={userId}
            />
          )}
          showsVerticalScrollIndicator={false}
          style={styles.historyList}
        />
      )}
    </View>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  const styles = useAppStyles(createStyles);

  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryMetricLabel}>{label}</Text>
      <Text numberOfLines={2} style={styles.summaryMetricValue}>
        {value}
      </Text>
    </View>
  );
}

function CardioHistoryRow({ item }: { item: CardioHistoryItem }) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <View style={styles.historyRow}>
      <View style={styles.historyRowHeader}>
        <View style={styles.historyIconBadge}>
          <Ionicons name="walk-outline" size={17} color={colors.primary} />
        </View>
        <View style={styles.historyTextBlock}>
          <Text style={styles.historyDate}>{item.dateLabel}</Text>
          <Text style={styles.historyMeta}>{strings.machineTracking.cardio}</Text>
        </View>
        <Text style={styles.historyMax}>{formatCardioValue(item)}</Text>
      </View>
    </View>
  );
}

function MachineHistoryRow({
  isExpanded,
  item,
  onToggle,
  userId,
}: {
  isExpanded: boolean;
  item: MachineHistoryItem;
  onToggle: () => void;
  userId: string;
}) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const historySetsQuery = useQuery({
    enabled: isExpanded && userId.length > 0,
    queryFn: () => loadMachineHistorySets({ historyItemId: item.id, userId }),
    queryKey: queryKeys.machineHistorySets(userId, item.id),
  });
  const historySets = historySetsQuery.data ?? [];

  return (
    <View style={styles.historyRow}>
      <Pressable
        accessibilityLabel={strings.accessibility.toggleHistorySets(item.dateLabel)}
        onPress={onToggle}
        style={({ pressed }) => [styles.historyRowHeader, pressed && styles.pressedRow]}
      >
        <View style={styles.historyIconBadge}>
          <Ionicons name="barbell-outline" size={17} color={colors.primary} />
        </View>
        <View style={styles.historyTextBlock}>
          <Text style={styles.historyDate}>{item.dateLabel}</Text>
          <Text style={styles.historyMeta}>{strings.stats.setCount(item.setCount)}</Text>
        </View>
        <Text style={styles.historyMax}>
          {item.maxWeightKg === null
            ? strings.stats.noWeight
            : strings.stats.workoutMax(formatWeight(item.maxWeightKg))}
        </Text>
      </Pressable>
      {isExpanded ? <MachineHistorySets sets={historySets} isLoading={historySetsQuery.isLoading} /> : null}
    </View>
  );
}

function MachineHistorySets({
  isLoading,
  sets,
}: {
  isLoading: boolean;
  sets: MachineHistorySet[];
}) {
  const styles = useAppStyles(createStyles);

  if (isLoading) {
    return <Text style={styles.historySetsHint}>{strings.stats.historySetsLoading}</Text>;
  }

  if (sets.length === 0) {
    return <Text style={styles.historySetsHint}>{strings.stats.historySetsEmpty}</Text>;
  }

  return (
    <View style={styles.historySets}>
      {sets.map((workoutSet) => (
        <View key={workoutSet.id} style={styles.historySetRow}>
          <Text style={styles.historySetNumber}>{strings.workouts.setNumber(workoutSet.setNumber)}</Text>
          <View style={styles.historySetContent}>
            <Text style={styles.historySetValues}>
              {formatHistorySetValues(workoutSet)}
            </Text>
            {workoutSet.note.trim().length > 0 ? (
              <Text style={styles.historySetNote}>{workoutSet.note}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function formatHistorySetValues(workoutSet: MachineHistorySet): string {
  const values = [
    workoutSet.weightKg === null
      ? strings.stats.noWeight
      : strings.workouts.weightValue(formatWeight(workoutSet.weightKg)),
  ];

  if (workoutSet.reps.trim().length > 0) {
    values.push(strings.workouts.repsValue(workoutSet.reps));
  }

  return values.join(' · ');
}

function formatCardioValue(item: CardioHistoryItem): string {
  return strings.stats.cardioValue(
    formatCardioDistance(item.distanceKm),
    formatCardioElevation(item.elevationMeters),
    formatCardioDuration(item.durationSeconds),
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseSummary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  exerciseSummaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  exerciseIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  exerciseSummaryText: {
    flex: 1,
    minWidth: 0,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  detailSubtitle: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  summaryMetricRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryMetric: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: 3,
    minHeight: 58,
    padding: 10,
  },
  summaryMetricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  summaryMetricValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  historyListContent: {
    flexGrow: 1,
    gap: 9,
    paddingBottom: 24,
    paddingTop: 10,
  },
  historyList: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flex: 1,
    marginTop: 2,
  },
  historyRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
  },
  historyRowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  historyIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  historyTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  historyDate: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  historyMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  historyMax: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    flexShrink: 1,
    lineHeight: 18,
    maxWidth: '48%',
    textAlign: 'right',
  },
  historySets: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  historySetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  historySetNumber: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    width: 22,
  },
  historySetContent: {
    flex: 1,
    gap: 2,
  },
  historySetValues: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  historySetNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  historySetsHint: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pressedRow: {
    opacity: 0.7,
  },
  });
}
