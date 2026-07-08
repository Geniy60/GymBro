import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { WorkoutSummary } from '../../types';

type WorkoutCardProps = {
  onDelete: () => void;
  onEdit: () => void;
  onRepeat: () => void;
  workout: WorkoutSummary;
};

export function WorkoutCard({
  onDelete,
  onEdit,
  onRepeat,
  workout,
}: WorkoutCardProps) {
  const workoutDateLabel = formatWorkoutCardDate(workout.startedAt);

  return (
    <Pressable
      accessibilityLabel={strings.accessibility.editWorkout}
      onPress={onEdit}
      style={({ pressed }) => [styles.card, pressed && styles.pressedButton]}
    >
      <View style={styles.cardTextBlock}>
        <Text numberOfLines={2} style={styles.cardTitle}>
          {workout.name}
        </Text>
        <View style={styles.cardMetaRow}>
          <Ionicons color={colors.muted} name="calendar-outline" size={14} />
          <Text numberOfLines={1} style={styles.cardMetaText}>
            {workoutDateLabel}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <Pressable
          accessibilityLabel={strings.accessibility.repeatWorkout}
          onPress={(event) => {
            event.stopPropagation();
            onRepeat();
          }}
          style={({ pressed }) => [
            styles.cardActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="sync-outline" size={20} color={colors.primary} />
        </Pressable>
        <Pressable
          accessibilityLabel={strings.accessibility.deleteWorkout}
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          style={({ pressed }) => [
            styles.cardActionButton,
            styles.destructiveActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="trash-outline" size={20} color={colors.destructive} />
        </Pressable>
      </View>
    </Pressable>
  );
}

function formatWorkoutCardDate(startedAt: string): string {
  const date = new Date(startedAt);

  if (Number.isNaN(date.getTime())) {
    return strings.workouts.unknownMonth;
  }

  const dateText = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });
  const timeText = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${dateText} · ${timeText}`;
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'stretch',
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderLeftColor: '#B7D8C5',
    borderLeftWidth: 3,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  cardTextBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 21,
  },
  cardMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
  },
  cardMetaText: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cardActionButton: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderColor: '#D9E0EA',
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  destructiveActionButton: {
    backgroundColor: '#FFF7F7',
    borderColor: colors.destructiveBorder,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
