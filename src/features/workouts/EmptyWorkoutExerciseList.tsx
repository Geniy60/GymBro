import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      <Text style={styles.helperText}>{strings.workouts.emptyExercises}</Text>
      <Pressable
        accessibilityLabel={strings.workouts.openSuggestMachines}
        onPress={onSuggestMachines}
        style={({ pressed }) => [
          styles.emptySuggestButton,
          pressed && styles.pressedButton,
        ]}
      >
        <LinearGradient
          colors={['#7C3AED', '#A855F7', '#EC4899']}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.suggestPrimaryGradient}
        >
          <Ionicons name="sparkles-outline" size={20} color={colors.panel} />
          <Text style={styles.emptySuggestButtonText}>
            {strings.workouts.openSuggestMachines}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyExercisesBlock: {
    alignItems: 'stretch',
    gap: 12,
    paddingTop: 6,
  },
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  emptySuggestButton: {
    alignSelf: 'stretch',
    borderRadius: 8,
    minHeight: 48,
    overflow: 'hidden',
  },
  suggestPrimaryGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
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
