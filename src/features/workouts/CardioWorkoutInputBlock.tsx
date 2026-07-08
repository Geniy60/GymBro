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
  const setupFields: CardioField[] = [
    {
      field: 'speedKmh',
      label: strings.workouts.cardioSpeedLabel,
      placeholder: strings.workouts.cardioSpeedPlaceholder,
      value: workoutSet.speedKmh,
    },
    {
      field: 'inclinePercent',
      label: strings.workouts.cardioInclineLabel,
      placeholder: strings.workouts.cardioInclinePlaceholder,
      value: workoutSet.inclinePercent,
    },
  ];
  const resultFields: CardioField[] = [
    {
      field: 'distanceKm',
      label: strings.workouts.cardioDistanceLabel,
      placeholder: strings.workouts.cardioDistancePlaceholder,
      value: workoutSet.distanceKm,
    },
    {
      field: 'elevationMeters',
      label: strings.workouts.cardioElevationLabel,
      placeholder: strings.workouts.cardioElevationPlaceholder,
      value: workoutSet.elevationMeters,
    },
    {
      field: 'durationMinutes',
      label: strings.workouts.cardioDurationLabel,
      placeholder: strings.workouts.cardioDurationPlaceholder,
      value: workoutSet.durationMinutes,
    },
  ];

  return (
    <View style={styles.cardioBlock}>
      <View style={styles.cardioRow}>
        {setupFields.map((field) => renderField(field, styles.setupField))}
      </View>
      <View style={styles.cardioRow}>
        {resultFields.map((field) => renderField(field, styles.resultField))}
      </View>
    </View>
  );

  function renderField(field: CardioField, fieldStyle: object) {
    return (
      <View key={field.field} style={[styles.cardioField, fieldStyle]}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={1}
          style={styles.cardioLabel}
        >
          {field.label}
        </Text>
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
    );
  }
}

const styles = StyleSheet.create({
  cardioBlock: {
    gap: 7,
  },
  cardioRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cardioField: {
    gap: 3,
    minWidth: 0,
  },
  setupField: {
    flex: 1,
  },
  resultField: {
    flex: 1,
  },
  cardioLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  cardioInput: {
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 13,
    height: 34,
    includeFontPadding: false,
    paddingBottom: 0,
    paddingHorizontal: 6,
    paddingTop: 1,
    textAlignVertical: 'center',
  },
});
