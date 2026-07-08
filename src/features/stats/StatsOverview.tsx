import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MachineTile } from '../../components/MachineTile';
import { SearchInput } from '../../components/SearchInput';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { ExerciseHistorySummary, Machine, WorkoutStats } from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';

type StatsOverviewProps = {
  maxMonthCount: number;
  onSelectHistoryItem: (item: ExerciseHistorySummary) => void;
  stats: WorkoutStats;
};

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function StatsOverview({
  maxMonthCount,
  onSelectHistoryItem,
  stats,
}: StatsOverviewProps) {
  const [historySearchText, setHistorySearchText] = useState('');
  const keyboardBottomInset = useKeyboardBottomInset();
  const filteredHistoryItems = useMemo(
    () => filterHistoryItems(stats.exerciseHistoryItems, historySearchText),
    [historySearchText, stats.exerciseHistoryItems],
  );
  const hasHistorySearch = historySearchText.trim().length > 0;

  return (
    <View style={styles.content}>
      <View style={styles.summaryRow}>
        <StatTile
          iconName="barbell-outline"
          label={strings.stats.totalWorkouts}
          value={String(stats.totalWorkouts)}
        />
        <StatTile
          iconName="calendar-outline"
          label={strings.stats.monthWorkouts}
          value={String(stats.monthWorkoutCount)}
        />
      </View>

      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>{strings.stats.chartTitle}</Text>
          <View style={styles.chartBadge}>
            <Ionicons color={colors.primary} name="trending-up-outline" size={15} />
          </View>
        </View>
        <View style={styles.chartRow}>
          {stats.monthStats.map((monthStat, index) => (
            <View key={monthStat.key} style={styles.chartItem}>
              <View style={styles.chartBarTrack}>
                <View
                  style={[
                    styles.chartBar,
                    index === stats.monthStats.length - 1 && styles.currentMonthChartBar,
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

      <View style={styles.historySection}>
        <View style={styles.searchRow}>
          <SearchInput
            onChangeText={setHistorySearchText}
            placeholder={strings.stats.historySearchPlaceholder}
            value={historySearchText}
          />
        </View>
        <FlatList
          columnWrapperStyle={styles.historyGridRow}
          contentContainerStyle={[
            styles.historyListContent,
            keyboardBottomInset > 0 && {
              paddingBottom: 12 + keyboardBottomInset,
            },
          ]}
          data={filteredHistoryItems}
          keyExtractor={(historyItem) => historyItem.id}
          keyboardDismissMode="on-drag"
          ListEmptyComponent={
            <View style={styles.emptyBlock}>
              <Text style={styles.emptyText}>
                {stats.exerciseHistoryItems.length === 0
                  ? strings.stats.historyListEmpty
                  : strings.empty.filtered.message}
              </Text>
              {hasHistorySearch ? (
                <Pressable
                  onPress={() => setHistorySearchText('')}
                  style={({ pressed }) => [
                    styles.resetSearchButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.resetSearchButtonText}>
                    {strings.actions.resetSearch}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.historyGridItem}>
              <MachineTile
                accessibilityLabel={strings.stats.openHistoryItem(item.machineName)}
                machine={createMachineFromHistoryItem(item)}
                onPress={() => onSelectHistoryItem(item)}
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

function StatTile({
  iconName,
  label,
  value,
}: {
  iconName: IoniconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIconBadge}>
        <Ionicons color={colors.primary} name={iconName} size={18} />
      </View>
      <View style={styles.statTextBlock}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function filterHistoryItems(
  items: ExerciseHistorySummary[],
  searchText: string,
): ExerciseHistorySummary[] {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();

  if (normalizedSearchText.length === 0) {
    return items;
  }

  return items.filter((item) => {
    const searchableText = [
      item.machineName,
      ...item.muscleGroups.map(
        (muscleGroup) => strings.muscleGroups.labels[muscleGroup],
      ),
      item.note,
    ].join(' ').toLocaleLowerCase();

    return searchableText.includes(normalizedSearchText);
  });
}

function createMachineFromHistoryItem(item: ExerciseHistorySummary): Machine {
  return {
    id: item.id,
    muscleGroups: item.muscleGroups,
    name: item.machineName,
    note: item.note,
    trackingType: item.trackingType,
  };
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
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statIconBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  statTextBlock: {
    flex: 1,
  },
  statValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  chartSection: {
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
    paddingVertical: 11,
  },
  historySection: {
    flex: 1,
  },
  chartHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  chartBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  chartRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 108,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarTrack: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: '100%',
  },
  chartBar: {
    backgroundColor: '#A7C7B7',
    borderRadius: 8,
    minHeight: 4,
    width: '100%',
  },
  currentMonthChartBar: {
    backgroundColor: colors.primary,
  },
  chartValue: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  chartLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  historyListContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 12,
  },
  historyGridRow: {
    gap: 10,
  },
  historyGridItem: {
    flex: 1,
    maxWidth: '48.5%',
  },
  emptyBlock: {
    gap: 10,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  resetSearchButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resetSearchButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
