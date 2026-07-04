import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { ExerciseHistorySummary, WorkoutStats } from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';

type StatsOverviewProps = {
  maxMonthCount: number;
  onSelectHistoryItem: (item: ExerciseHistorySummary) => void;
  stats: WorkoutStats;
};

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
          label={strings.stats.totalWorkouts}
          value={String(stats.totalWorkouts)}
        />
        <StatTile
          label={strings.stats.monthWorkouts}
          value={String(stats.monthWorkoutCount)}
        />
      </View>

      <View style={[styles.section, styles.chartSection]}>
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

      <View style={[styles.section, styles.historySection]}>
        <Text style={styles.sectionTitle}>{strings.stats.historyListTitle}</Text>
        <View style={styles.searchRow}>
          <Ionicons color={colors.muted} name="search-outline" size={18} />
          <TextInput
            accessibilityLabel={strings.accessibility.search}
            onChangeText={setHistorySearchText}
            placeholder={strings.stats.historySearchPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={historySearchText}
          />
          {hasHistorySearch ? (
            <Pressable
              accessibilityLabel={strings.accessibility.clearSearch}
              onPress={() => setHistorySearchText('')}
              style={({ pressed }) => [
                styles.clearSearchButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons color={colors.muted} name="close" size={18} />
            </Pressable>
          ) : null}
        </View>
        <FlatList
          contentContainerStyle={[
            styles.historyListContent,
            keyboardBottomInset > 0 && {
              paddingBottom: 4 + keyboardBottomInset,
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
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelectHistoryItem(item)}
              style={({ pressed }) => [
                styles.historyRow,
                pressed && styles.pressedButton,
              ]}
            >
              <Text numberOfLines={1} style={styles.historyMachineName}>
                {item.machineName}
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

function filterHistoryItems(
  items: ExerciseHistorySummary[],
  searchText: string,
): ExerciseHistorySummary[] {
  const normalizedSearchText = searchText.trim().toLocaleLowerCase();

  if (normalizedSearchText.length === 0) {
    return items;
  }

  return items.filter((item) =>
    item.machineName.toLocaleLowerCase().includes(normalizedSearchText),
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
    marginBottom: 9,
  },
  statTile: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  section: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  historySection: {
    flex: 1,
  },
  chartSection: {
    paddingVertical: 11,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 9,
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
    marginTop: 3,
  },
  chartLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  searchRow: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 40,
    marginBottom: 9,
    paddingHorizontal: 10,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  clearSearchButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  historyListContent: {
    gap: 8,
    paddingBottom: 4,
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
  historyRow: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  historyMachineName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
