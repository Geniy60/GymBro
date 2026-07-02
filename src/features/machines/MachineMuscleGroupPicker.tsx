import { Pressable, StyleSheet, Text, View } from 'react-native';

import { muscleGroups } from '../../muscleGroups';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { MuscleGroup } from '../../types';

type MachineMuscleGroupPickerProps = {
  onToggleMuscleGroup: (muscleGroup: MuscleGroup) => void;
  selectedMuscleGroups: MuscleGroup[];
};

export function MachineMuscleGroupPicker({
  onToggleMuscleGroup,
  selectedMuscleGroups,
}: MachineMuscleGroupPickerProps) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{strings.forms.machine.muscleGroupLabel}</Text>
      <Text style={styles.fieldHint}>{strings.forms.machine.muscleGroupHint}</Text>
      <View style={styles.tagGrid}>
        {muscleGroups.map((muscleGroup) => {
          const isSelected = selectedMuscleGroups.includes(muscleGroup);

          return (
            <Pressable
              accessibilityLabel={strings.muscleGroups.labels[muscleGroup]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              key={muscleGroup}
              onPress={() => onToggleMuscleGroup(muscleGroup)}
              style={({ pressed }) => [
                styles.tagButton,
                isSelected && styles.selectedTagButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text
                style={[
                  styles.tagButtonText,
                  isSelected && styles.selectedTagButtonText,
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
  formField: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  fieldHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedTagButton: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.primary,
  },
  tagButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedTagButtonText: {
    color: '#166534',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
