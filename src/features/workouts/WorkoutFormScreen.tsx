import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Workout, WorkoutDraft } from '../../types';

type WorkoutFormScreenProps = {
  onBack: () => void;
  onSave: (workout: Workout) => void;
  workout: Workout | null;
};

const emptyWorkoutDraft: WorkoutDraft = {
  name: '',
  note: '',
};

export function WorkoutFormScreen({
  onBack,
  onSave,
  workout,
}: WorkoutFormScreenProps) {
  const [workoutDraft, setWorkoutDraft] = useState<WorkoutDraft>(() =>
    workout === null
      ? emptyWorkoutDraft
      : {
          name: workout.name,
          note: workout.note,
        },
  );
  const [workoutNameError, setWorkoutNameError] = useState('');

  const isEditingWorkout = workout !== null;

  function updateWorkoutDraft(field: keyof WorkoutDraft, value: string) {
    setWorkoutDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    if (field === 'name' && value.trim().length > 0) {
      setWorkoutNameError('');
    }
  }

  function saveWorkout() {
    const nextDraft: WorkoutDraft = {
      name: workoutDraft.name.trim(),
      note: workoutDraft.note.trim(),
    };

    if (nextDraft.name.length === 0) {
      setWorkoutNameError(strings.forms.workout.errors.nameRequired);
      return;
    }

    onSave({
      id: workout?.id ?? String(Date.now()),
      ...nextDraft,
    });
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.secondaryHeader}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.secondaryTitle}>
            {isEditingWorkout
              ? strings.forms.workout.editTitle
              : strings.forms.workout.addTitle}
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>{strings.forms.workout.nameLabel}</Text>
          <TextInput
            accessibilityLabel={strings.forms.workout.nameLabel}
            autoFocus
            onChangeText={(value) => updateWorkoutDraft('name', value)}
            placeholder={strings.forms.workout.namePlaceholder}
            placeholderTextColor={colors.muted}
            style={[
              styles.formInput,
              workoutNameError.length > 0 && styles.inputError,
            ]}
            value={workoutDraft.name}
          />
          {workoutNameError.length > 0 ? (
            <Text style={styles.errorText}>{workoutNameError}</Text>
          ) : null}
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>{strings.forms.workout.noteLabel}</Text>
          <TextInput
            accessibilityLabel={strings.forms.workout.noteLabel}
            multiline
            onChangeText={(value) => updateWorkoutDraft('note', value)}
            placeholder={strings.forms.workout.notePlaceholder}
            placeholderTextColor={colors.muted}
            style={[styles.formInput, styles.noteInput]}
            textAlignVertical="top"
            value={workoutDraft.note}
          />
        </View>

        <Pressable
          accessibilityLabel={strings.accessibility.saveWorkout}
          onPress={saveWorkout}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.saveButtonText}>{strings.actions.save}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContent: {
    paddingBottom: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    width: 37,
  },
  secondaryTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  formField: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  noteInput: {
    minHeight: 104,
    paddingTop: 12,
  },
  inputError: {
    borderColor: colors.destructive,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
