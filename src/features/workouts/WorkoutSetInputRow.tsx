import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { WorkoutSet } from '../../types';

type WorkoutSetInputRowProps = {
  deleteSet: (exerciseId: string, setId: string) => void;
  exerciseId: string;
  index: number;
  isNoteVisible: boolean;
  previousMaxWeightKg: number | undefined;
  toggleSetNote: (setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    field: keyof WorkoutSet,
    value: string,
  ) => void;
  workoutSet: WorkoutSet;
};

type FocusedSetInput = 'reps' | 'weightKg' | null;

export function WorkoutSetInputRow({
  deleteSet,
  exerciseId,
  index,
  isNoteVisible,
  previousMaxWeightKg,
  toggleSetNote,
  updateSet,
  workoutSet,
}: WorkoutSetInputRowProps) {
  const isRecord = isRecordSet(workoutSet, previousMaxWeightKg);
  const hasVisibleNote = isNoteVisible || workoutSet.note.length > 0;
  const [focusedInput, setFocusedInput] = useState<FocusedSetInput>(null);

  return (
    <View style={styles.setBlock}>
      <View style={styles.setRow}>
        <Text style={styles.setNumber}>{strings.workouts.setNumber(index + 1)}</Text>
        <TextInput
          accessibilityLabel={strings.workouts.weightLabel}
          keyboardType="decimal-pad"
          onChangeText={(value) =>
            updateSet(
              exerciseId,
              workoutSet.id,
              'weightKg',
              stripInputUnit(value, strings.workouts.weightUnit),
            )
          }
          onBlur={() => setFocusedInput((currentInput) =>
            currentInput === 'weightKg' ? null : currentInput
          )}
          onFocus={() => setFocusedInput('weightKg')}
          placeholder={strings.workouts.weightPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.smallInput}
          value={formatWeightInputValue(
            workoutSet.weightKg,
            focusedInput === 'weightKg',
          )}
        />
        <TextInput
          accessibilityLabel={strings.workouts.repsLabel}
          keyboardType="number-pad"
          onChangeText={(value) =>
            updateSet(
              exerciseId,
              workoutSet.id,
              'reps',
              stripInputUnit(value, strings.workouts.repsUnit),
            )
          }
          onBlur={() => setFocusedInput((currentInput) =>
            currentInput === 'reps' ? null : currentInput
          )}
          onFocus={() => setFocusedInput('reps')}
          placeholder={strings.workouts.repsPlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.smallInput}
          value={formatRepsInputValue(workoutSet.reps, focusedInput === 'reps')}
        />
        <View style={styles.setActions}>
          <Pressable
            accessibilityLabel={strings.workouts.toggleSetNote}
            onPress={() => toggleSetNote(workoutSet.id)}
            style={({ pressed }) => [
              styles.smallIconButton,
              styles.smallNoteButton,
              hasVisibleNote && styles.activeSmallNoteButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              color={hasVisibleNote ? colors.primary : colors.text}
              name="document-text-outline"
              size={18}
            />
          </Pressable>
          <Pressable
            accessibilityLabel={strings.workouts.deleteSet}
            onPress={() => deleteSet(exerciseId, workoutSet.id)}
            style={({ pressed }) => [
              styles.smallIconButton,
              styles.smallDeleteButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons color={colors.destructive} name="trash-outline" size={18} />
          </Pressable>
          <View
            accessibilityLabel={strings.workouts.recordBadge}
            accessible={isRecord}
            style={[styles.recordBadge, !isRecord && styles.hiddenRecordBadge]}
          >
            {isRecord ? (
              <Ionicons name="trophy-outline" size={17} color="#92400E" />
            ) : null}
          </View>
        </View>
      </View>
      {hasVisibleNote ? (
        <TextInput
          accessibilityLabel={strings.workouts.setNoteLabel}
          onChangeText={(value) => updateSet(exerciseId, workoutSet.id, 'note', value)}
          placeholder={strings.workouts.setNotePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.setNoteInput}
          value={workoutSet.note}
        />
      ) : null}
    </View>
  );
}

function formatWeightInputValue(weightKg: string, isFocused: boolean): string {
  const trimmedWeightKg = weightKg.trim();

  if (isFocused || trimmedWeightKg.length === 0) {
    return weightKg;
  }

  return strings.workouts.weightValue(trimmedWeightKg);
}

function formatRepsInputValue(reps: string, isFocused: boolean): string {
  const trimmedReps = reps.trim();

  if (isFocused || trimmedReps.length === 0) {
    return reps;
  }

  return strings.workouts.repsValue(trimmedReps);
}

function stripInputUnit(value: string, unit: string): string {
  const trimmedValue = value.trim();

  return trimmedValue.replace(new RegExp(`\\s*${escapeRegExp(unit)}$`, 'i'), '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
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
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
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
  smallNoteButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D9E0EA',
  },
  activeSmallNoteButton: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
  },
  smallDeleteButton: {
    backgroundColor: '#FFF7F7',
    borderColor: colors.destructiveBorder,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
