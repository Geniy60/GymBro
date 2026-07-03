import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ListLoadingState } from '../../components/ListLoadingState';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type {
  CardioHistoryItem,
  CardioSummary,
  MachineHistoryItem,
  MachineMax,
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
  mode: 'cardio' | 'strength';
  onBack: () => void;
  selectedItem: CardioSummary | MachineMax;
};

export function MachineHistoryScreen({
  cardioHistoryItems = [],
  historyItems,
  isLoadingHistory,
  mode,
  onBack,
  selectedItem,
}: MachineHistoryScreenProps) {
  return (
    <View style={styles.content}>
      <View style={styles.detailHeader}>
        <Pressable
          accessibilityLabel={strings.accessibility.back}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailTitle}>{selectedItem.machineName}</Text>
          <Text style={styles.detailSubtitle}>{strings.stats.historyTitle}</Text>
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
              <Text style={styles.emptyText}>{strings.stats.historyEmpty}</Text>
            )
          }
          renderItem={({ item }) => <CardioHistoryRow item={item} />}
          showsVerticalScrollIndicator={false}
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
              <Text style={styles.emptyText}>{strings.stats.historyEmpty}</Text>
            )
          }
          renderItem={({ item }) => <MachineHistoryRow item={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function CardioHistoryRow({ item }: { item: CardioHistoryItem }) {
  return (
    <View style={styles.historyRow}>
      <View style={styles.historyTextBlock}>
        <Text style={styles.historyDate}>{item.dateLabel}</Text>
      </View>
      <Text style={styles.historyMax}>{formatCardioValue(item)}</Text>
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

function formatCardioValue(item: CardioHistoryItem): string {
  return strings.stats.cardioValue(
    formatCardioDistance(item.distanceKm),
    formatCardioElevation(item.elevationMeters),
    formatCardioDuration(item.durationSeconds),
  );
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
  historyListContent: {
    gap: 8,
    paddingBottom: 24,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
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
  pressedButton: {
    opacity: 0.7,
  },
});
