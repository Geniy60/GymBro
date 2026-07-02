import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { WorkoutExercise, WorkoutSet } from '../../types';
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

  return (
    <View style={[styles.exerciseCard, isCollapsed && styles.collapsedExerciseCard]}>
      <View
        style={[
          styles.exerciseHeader,
          isCollapsed && styles.collapsedExerciseHeader,
        ]}
      >
        <View style={styles.exerciseTitleBlock}>
          <Text style={styles.exerciseTitle}>{exercise.machineName}</Text>
        </View>
        <View style={styles.exerciseHeaderActions}>
          {isCollapsed ? null : (
            <>
              <Pressable
                accessibilityLabel={strings.workouts.clearExerciseSets}
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
              color={colors.text}
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
            />
          </Pressable>
        </View>
      </View>

      {isCollapsed ? null : (
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
            <Text style={styles.secondaryButtonText}>{strings.workouts.addSet}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 9,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  collapsedExerciseCard: {
    backgroundColor: '#FCFDFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  exerciseHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  collapsedExerciseHeader: {
    marginBottom: 0,
    minHeight: 40,
  },
  exerciseTitleBlock: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  exerciseHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  exerciseTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  smallIconButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  collapseButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  smallClearButton: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.primary,
  },
  smallDeleteButton: {
    backgroundColor: '#FFF7F7',
    borderColor: colors.destructiveBorder,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderColor: '#86CFA8',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
