import { Pressable, StyleSheet, Text, View } from 'react-native';

import { muscleGroups } from '../../muscleGroups';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { MuscleGroup } from '../../types';

type SuggestMuscleGroupPickerProps = {
  onToggleMuscleGroup: (muscleGroup: MuscleGroup) => void;
  selectedMuscleGroups: MuscleGroup[];
};

export function SuggestMuscleGroupPicker({
  onToggleMuscleGroup,
  selectedMuscleGroups,
}: SuggestMuscleGroupPickerProps) {
  return (
    <View style={styles.suggestSection}>
      <Text style={styles.suggestSectionTitle}>
        {strings.workouts.suggestMuscleGroupsTitle}
      </Text>
      <View style={styles.suggestChipGrid}>
        {muscleGroups.map((muscleGroup) => {
          const isSelected = selectedMuscleGroups.includes(muscleGroup);

          return (
            <Pressable
              accessibilityLabel={strings.workouts.toggleSuggestMuscleGroup(
                strings.muscleGroups.labels[muscleGroup],
              )}
              key={muscleGroup}
              onPress={() => onToggleMuscleGroup(muscleGroup)}
              style={({ pressed }) => [
                styles.suggestChip,
                isSelected && styles.selectedSuggestChip,
                pressed && styles.pressedButton,
              ]}
            >
              <Text
                style={[
                  styles.suggestChipText,
                  isSelected && styles.selectedSuggestChipText,
                ]}
              >
                {strings.muscleGroups.labels[muscleGroup]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  suggestSection: {
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
  suggestSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  suggestChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestChip: {
    backgroundColor: colors.background,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  selectedSuggestChip: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
  },
  suggestChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedSuggestChipText: {
    color: colors.primary,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
