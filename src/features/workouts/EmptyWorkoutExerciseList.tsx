import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { useAppStyles, useAppTheme } from '../../ThemeProvider';
import type { AppThemeColors } from '../../theme/colors';

type EmptyWorkoutExerciseListProps = {
  onSuggestMachines: () => void;
};

export function EmptyWorkoutExerciseList({
  onSuggestMachines,
}: EmptyWorkoutExerciseListProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  return (
    <View style={styles.emptyExercisesBlock}>
      <View style={styles.emptyIconBadge}>
        <Ionicons name="barbell-outline" size={24} color={colors.primary} />
      </View>
      <Text style={styles.helperText}>{strings.workouts.emptyExercises}</Text>
      <Pressable
        accessibilityLabel={strings.workouts.openSuggestMachines}
        onPress={onSuggestMachines}
        style={({ pressed }) => [
          styles.emptySuggestButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Ionicons name="sparkles-outline" size={20} color={colors.panel} />
        <Text style={styles.emptySuggestButtonText}>
          {strings.workouts.openSuggestMachines}
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  emptyExercisesBlock: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  emptyIconBadge: {
    alignItems: 'center',
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptySuggestButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  emptySuggestButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
  });
}
