import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';

type EmptyWorkoutExerciseListProps = {
  onSuggestMachines: () => void;
};

export function EmptyWorkoutExerciseList({
  onSuggestMachines,
}: EmptyWorkoutExerciseListProps) {
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

const styles = StyleSheet.create({
  emptyExercisesBlock: {
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  emptyIconBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderColor: '#D5EBDD',
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
