import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Workout } from '../../types';

type WorkoutCardProps = {
  onDelete: () => void;
  onEdit: () => void;
  onRepeat: () => void;
  workout: Workout;
};

export function WorkoutCard({
  onDelete,
  onEdit,
  onRepeat,
  workout,
}: WorkoutCardProps) {
  return (
    <Pressable
      accessibilityLabel={strings.accessibility.editWorkout}
      onPress={onEdit}
      style={({ pressed }) => [styles.card, pressed && styles.pressedButton]}
    >
      <View style={styles.cardTextBlock}>
        <Text style={styles.cardTitle}>{workout.name}</Text>
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
          <Ionicons name="sync-outline" size={20} color={colors.text} />
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
          <Text style={[styles.iconButtonText, styles.deleteButtonText]}>
            {strings.actions.deleteIcon}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cardActionButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconButtonText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  destructiveActionButton: {
    borderColor: colors.destructiveBorder,
  },
  deleteButtonText: {
    color: colors.destructive,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
