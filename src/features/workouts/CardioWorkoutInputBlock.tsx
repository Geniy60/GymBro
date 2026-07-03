import { StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { WorkoutSet } from '../../types';

type CardioWorkoutInputBlockProps = {
  exerciseId: string;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string,
  ) => void;
  workoutSet: WorkoutSet;
};

type CardioField = {
  field: keyof Pick<
    WorkoutSet,
    | 'distanceKm'
    | 'durationMinutes'
    | 'elevationMeters'
    | 'inclinePercent'
    | 'speedKmh'
  >;
  label: string;
  placeholder: string;
  value: string;
};

export function CardioWorkoutInputBlock({
  exerciseId,
  updateSet,
  workoutSet,
}: CardioWorkoutInputBlockProps) {
  const fields: CardioField[] = [
    {
      field: 'durationMinutes',
      label: strings.workouts.cardioDurationLabel,
      placeholder: strings.workouts.cardioDurationPlaceholder,
      value: workoutSet.durationMinutes,
    },
    {
      field: 'distanceKm',
      label: strings.workouts.cardioDistanceLabel,
      placeholder: strings.workouts.cardioDistancePlaceholder,
      value: workoutSet.distanceKm,
    },
    {
      field: 'inclinePercent',
      label: strings.workouts.cardioInclineLabel,
      placeholder: strings.workouts.cardioInclinePlaceholder,
      value: workoutSet.inclinePercent,
    },
    {
      field: 'elevationMeters',
      label: strings.workouts.cardioElevationLabel,
      placeholder: strings.workouts.cardioElevationPlaceholder,
      value: workoutSet.elevationMeters,
    },
    {
      field: 'speedKmh',
      label: strings.workouts.cardioSpeedLabel,
      placeholder: strings.workouts.cardioSpeedPlaceholder,
      value: workoutSet.speedKmh,
    },
  ];

  return (
    <View style={styles.cardioGrid}>
      {fields.map((field) => (
        <View key={field.field} style={styles.cardioField}>
          <Text style={styles.cardioLabel}>{field.label}</Text>
          <TextInput
            accessibilityLabel={field.label}
            keyboardType="decimal-pad"
            onChangeText={(value) =>
              updateSet(exerciseId, workoutSet.id, field.field, value)
            }
            placeholder={field.placeholder}
            placeholderTextColor={colors.muted}
            style={styles.cardioInput}
            value={field.value}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cardioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardioField: {
    flexBasis: '48%',
    flexGrow: 1,
    gap: 5,
    minWidth: 116,
  },
  cardioLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  cardioInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    height: 38,
    includeFontPadding: false,
    paddingBottom: 0,
    paddingHorizontal: 8,
    paddingTop: 2,
    textAlignVertical: 'center',
  },
});
