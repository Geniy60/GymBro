import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { WorkoutExercise, WorkoutSet } from '../../types';
import { CardioWorkoutInputBlock } from './CardioWorkoutInputBlock';
import { WorkoutSetInputRow } from './WorkoutSetInputRow';

type WorkoutExerciseCardProps = {
  addSet: (exerciseId: string) => void;
  clearExerciseSets: (exerciseId: string) => void;
  collapsedExerciseIds: string[];
  deleteExercise: (exerciseId: string) => void;
  deleteSet: (exerciseId: string, setId: string) => void;
  exercise: WorkoutExercise;
  previousMaxWeightKg: number | undefined;
  toggleExerciseCollapse: (exerciseId: string) => void;
  toggleSetNote: (setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string,
  ) => void;
  visibleSetNoteIds: string[];
};

export function WorkoutExerciseCard({
  addSet,
  clearExerciseSets,
  collapsedExerciseIds,
  deleteExercise,
  deleteSet,
  exercise,
  previousMaxWeightKg,
  toggleExerciseCollapse,
  toggleSetNote,
  updateSet,
  visibleSetNoteIds,
}: WorkoutExerciseCardProps) {
  const isCollapsed = collapsedExerciseIds.includes(exercise.id);
  const isCardioExercise = exercise.trackingType === 'cardio';
  const cardioSet = exercise.sets[0];

  return (
    <View style={[styles.exerciseCard, isCollapsed && styles.collapsedExerciseCard]}>
      <View
        style={[
          styles.exerciseHeader,
          isCollapsed && styles.collapsedExerciseHeader,
        ]}
      >
        <Pressable
          accessibilityLabel={
            isCollapsed
              ? strings.workouts.expandExercise
              : strings.workouts.collapseExercise
          }
          accessibilityRole="button"
          hitSlop={6}
          onPress={() => toggleExerciseCollapse(exercise.id)}
          style={({ pressed }) => [
            styles.exerciseTitleBlock,
            pressed && styles.pressedButton,
          ]}
        >
          <Text numberOfLines={isCollapsed ? 1 : 2} style={styles.exerciseTitle}>
            {exercise.machineName}
          </Text>
        </Pressable>
        <View style={styles.exerciseHeaderActions}>
          {isCollapsed ? null : (
            <>
              <Pressable
                accessibilityLabel={
                  isCardioExercise
                    ? strings.workouts.clearCardioSet
                    : strings.workouts.clearExerciseSets
                }
                onPress={() => clearExerciseSets(exercise.id)}
                style={({ pressed }) => [
                  styles.smallIconButton,
                  styles.smallClearButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons color={colors.primary} name="refresh" size={18} />
              </Pressable>
              <Pressable
                accessibilityLabel={strings.workouts.deleteExercise}
                onPress={() => deleteExercise(exercise.id)}
                style={({ pressed }) => [
                  styles.smallIconButton,
                  styles.smallDeleteButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons
                  color={colors.destructive}
                  name="trash-outline"
                  size={18}
                />
              </Pressable>
            </>
          )}
          {isCollapsed ? (
            <View
              style={[
                styles.trackingBadge,
                exercise.trackingType === 'cardio' && styles.cardioBadge,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.trackingBadgeText,
                  exercise.trackingType === 'cardio' && styles.cardioBadgeText,
                ]}
              >
                {strings.machineTracking[exercise.trackingType]}
              </Text>
            </View>
          ) : null}
          <Pressable
            accessibilityLabel={
              isCollapsed
                ? strings.workouts.expandExercise
                : strings.workouts.collapseExercise
            }
            onPress={() => toggleExerciseCollapse(exercise.id)}
            style={({ pressed }) => [
              styles.smallIconButton,
              styles.collapseButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              color={colors.primary}
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
            />
          </Pressable>
        </View>
      </View>

      {isCollapsed ? null : (
        <View style={styles.exerciseBody}>
          {isCardioExercise && cardioSet !== undefined ? (
            <CardioWorkoutInputBlock
              exerciseId={exercise.id}
              updateSet={updateSet}
              workoutSet={cardioSet}
            />
          ) : (
            <>
              {exercise.sets.map((workoutSet, index) => (
                <WorkoutSetInputRow
                  deleteSet={deleteSet}
                  exerciseId={exercise.id}
                  index={index}
                  isNoteVisible={visibleSetNoteIds.includes(workoutSet.id)}
                  key={workoutSet.id}
                  previousMaxWeightKg={previousMaxWeightKg}
                  toggleSetNote={toggleSetNote}
                  updateSet={updateSet}
                  workoutSet={workoutSet}
                />
              ))}

              <Pressable
                accessibilityLabel={strings.workouts.addSet}
                onPress={() => addSet(exercise.id)}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Ionicons name="add" size={18} color={colors.primary} />
                <Text style={styles.secondaryButtonText}>
                  {strings.workouts.addSet}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderLeftColor: '#B7D8C5',
    borderLeftWidth: 3,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },
  collapsedExerciseCard: {
    backgroundColor: '#FBFDFB',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  collapsedExerciseHeader: {
    marginBottom: 0,
    minHeight: 44,
  },
  exerciseTitleBlock: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  exerciseHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  exerciseTitle: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
  },
  trackingBadge: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  cardioBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FBBF24',
  },
  trackingBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 14,
  },
  cardioBadgeText: {
    color: '#D97706',
  },
  exerciseBody: {
    borderTopColor: '#E8EDF5',
    borderTopWidth: 1,
    marginTop: 9,
    paddingTop: 9,
  },
  smallIconButton: {
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  collapseButton: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
  },
  smallClearButton: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
  },
  smallDeleteButton: {
    backgroundColor: '#FEF3F2',
    borderColor: colors.destructiveBorder,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F4FBF7',
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
