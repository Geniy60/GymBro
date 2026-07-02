import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { WorkoutExercise, WorkoutSet } from '../../types';

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
          {exercise.sets.map((workoutSet, index) => {
            const isRecord = isRecordSet(workoutSet, previousMaxWeightKg);

            return (
              <View key={workoutSet.id} style={styles.setBlock}>
                <View style={styles.setRow}>
                  <Text style={styles.setNumber}>
                    {strings.workouts.setNumber(index + 1)}
                  </Text>
                  <TextInput
                    accessibilityLabel={strings.workouts.weightLabel}
                    keyboardType="decimal-pad"
                    onChangeText={(value) =>
                      updateSet(exercise.id, workoutSet.id, 'weightKg', value)
                    }
                    placeholder={strings.workouts.weightPlaceholder}
                    placeholderTextColor={colors.muted}
                    style={styles.smallInput}
                    value={workoutSet.weightKg}
                  />
                  <TextInput
                    accessibilityLabel={strings.workouts.repsLabel}
                    keyboardType="number-pad"
                    onChangeText={(value) =>
                      updateSet(exercise.id, workoutSet.id, 'reps', value)
                    }
                    placeholder={strings.workouts.repsPlaceholder}
                    placeholderTextColor={colors.muted}
                    style={styles.smallInput}
                    value={workoutSet.reps}
                  />
                  <View style={styles.setActions}>
                    <Pressable
                      accessibilityLabel={strings.workouts.toggleSetNote}
                      onPress={() => toggleSetNote(workoutSet.id)}
                      style={({ pressed }) => [
                        styles.smallIconButton,
                        styles.smallNoteButton,
                        (visibleSetNoteIds.includes(workoutSet.id) ||
                          workoutSet.note.length > 0) &&
                          styles.activeSmallNoteButton,
                        pressed && styles.pressedButton,
                      ]}
                    >
                      <Ionicons
                        color={
                          visibleSetNoteIds.includes(workoutSet.id) ||
                          workoutSet.note.length > 0
                            ? '#6D28D9'
                            : colors.text
                        }
                        name="document-text-outline"
                        size={18}
                      />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={strings.workouts.deleteSet}
                      onPress={() => deleteSet(exercise.id, workoutSet.id)}
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
                    <View
                      accessibilityLabel={strings.workouts.recordBadge}
                      accessible={isRecord}
                      style={[
                        styles.recordBadge,
                        !isRecord && styles.hiddenRecordBadge,
                      ]}
                    >
                      {isRecord ? (
                        <Ionicons name="trophy-outline" size={17} color="#92400E" />
                      ) : null}
                    </View>
                  </View>
                </View>
                {visibleSetNoteIds.includes(workoutSet.id) ||
                workoutSet.note.length > 0 ? (
                  <TextInput
                    accessibilityLabel={strings.workouts.setNoteLabel}
                    onChangeText={(value) =>
                      updateSet(exercise.id, workoutSet.id, 'note', value)
                    }
                    placeholder={strings.workouts.setNotePlaceholder}
                    placeholderTextColor={colors.muted}
                    style={styles.setNoteInput}
                    value={workoutSet.note}
                  />
                ) : null}
              </View>
            );
          })}

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

function isRecordSet(
  workoutSet: WorkoutSet,
  previousMaxWeightKg: number | undefined,
): boolean {
  if (previousMaxWeightKg === undefined) {
    return false;
  }

  const weightKg = parseWeightKg(workoutSet.weightKg);

  return weightKg !== null && weightKg > previousMaxWeightKg;
}

function parseWeightKg(weightKg: string): number | null {
  const normalizedWeightKg = weightKg.trim().replace(',', '.');

  if (normalizedWeightKg.length === 0) {
    return null;
  }

  const parsedWeightKg = Number(normalizedWeightKg);

  return Number.isFinite(parsedWeightKg) ? parsedWeightKg : null;
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
  setRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
  },
  setActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    marginLeft: 'auto',
  },
  setBlock: {
    gap: 7,
    marginBottom: 8,
  },
  setNumber: {
    backgroundColor: '#EEF2F7',
    borderColor: '#D9E0EA',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    height: 38,
    lineHeight: 36,
    overflow: 'hidden',
    textAlign: 'center',
    width: 32,
  },
  smallInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    height: 38,
    includeFontPadding: false,
    paddingHorizontal: 6,
    paddingBottom: 0,
    paddingTop: 2,
    textAlignVertical: 'center',
    width: 74,
  },
  setNoteInput: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 14,
    minHeight: 34,
    paddingHorizontal: 8,
  },
  recordBadge: {
    alignItems: 'center',
    backgroundColor: '#FFF7D6',
    borderColor: '#F59E0B',
    borderRadius: 8,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 38,
  },
  hiddenRecordBadge: {
    opacity: 0,
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
  smallNoteButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  activeSmallNoteButton: {
    backgroundColor: '#EDE9FE',
    borderColor: '#6D28D9',
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
