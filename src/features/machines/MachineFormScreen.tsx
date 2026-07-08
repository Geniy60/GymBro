import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { createId } from '../../createId';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type {
  Machine,
  MachineDraft,
  MachineTrackingType,
  MuscleGroup,
} from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';
import { MachineFormActions } from './MachineFormActions';
import { MachineMuscleGroupPicker } from './MachineMuscleGroupPicker';

type MachineFormScreenProps = {
  backgroundColor: string;
  machine: Machine | null;
  onBack: () => void;
  onDelete?: (machine: Machine) => void;
  onSave: (machine: Machine) => void;
};

const emptyMachineDraft: MachineDraft = {
  name: '',
  muscleGroups: [],
  note: '',
  trackingType: 'strength',
};

export function MachineFormScreen({
  backgroundColor,
  machine,
  onBack,
  onDelete,
  onSave,
}: MachineFormScreenProps) {
  const [machineDraft, setMachineDraft] = useState<MachineDraft>(() =>
    machine === null
      ? emptyMachineDraft
      : {
          name: machine.name,
          muscleGroups: machine.muscleGroups,
          note: machine.note,
          trackingType: machine.trackingType,
        },
  );
  const [machineNameError, setMachineNameError] = useState('');
  const keyboardBottomInset = useKeyboardBottomInset();

  const isEditingMachine = machine !== null;

  function updateMachineTextDraft(field: 'name' | 'note', value: string) {
    setMachineDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    if (field === 'name' && value.trim().length > 0) {
      setMachineNameError('');
    }
  }

  function toggleMuscleGroup(muscleGroup: MuscleGroup) {
    setMachineDraft((currentDraft) => ({
      ...currentDraft,
      muscleGroups: currentDraft.muscleGroups.includes(muscleGroup)
        ? currentDraft.muscleGroups.filter(
            (currentMuscleGroup) => currentMuscleGroup !== muscleGroup,
          )
        : [...currentDraft.muscleGroups, muscleGroup],
    }));
  }

  function updateTrackingType(trackingType: MachineTrackingType) {
    setMachineDraft((currentDraft) => ({
      ...currentDraft,
      trackingType,
    }));
  }

  function saveMachine() {
    const nextDraft: MachineDraft = {
      name: machineDraft.name.trim(),
      muscleGroups: machineDraft.muscleGroups,
      note: machineDraft.note.trim(),
      trackingType: machineDraft.trackingType,
    };

    if (nextDraft.name.length === 0) {
      setMachineNameError(strings.forms.machine.errors.nameRequired);
      return;
    }

    onSave({
      id: machine?.id ?? createId(),
      ...nextDraft,
    });
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.formContent,
          ]}
          style={[
            styles.formScroll,
            keyboardBottomInset > 0 && { marginBottom: keyboardBottomInset },
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <SecondaryScreenHeader
            marginBottom={18}
            onBack={onBack}
            title={
              isEditingMachine
                ? strings.forms.machine.editTitle
                : strings.forms.machine.addTitle
            }
          />

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>{strings.forms.machine.nameLabel}</Text>
            <TextInput
              accessibilityLabel={strings.forms.machine.nameLabel}
              autoFocus
              onChangeText={(value) => updateMachineTextDraft('name', value)}
              placeholder={strings.forms.machine.namePlaceholder}
              placeholderTextColor={colors.muted}
              style={[
                styles.formInput,
                machineNameError.length > 0 && styles.inputError,
              ]}
              value={machineDraft.name}
            />
            {machineNameError.length > 0 ? (
              <Text style={styles.errorText}>{machineNameError}</Text>
            ) : null}
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              {strings.forms.machine.trackingTypeLabel}
            </Text>
            <View style={styles.trackingTypeControl}>
              {(['strength', 'cardio'] as const).map((trackingType) => {
                const isSelected = machineDraft.trackingType === trackingType;

                return (
                  <Pressable
                    accessibilityLabel={strings.machineTracking[trackingType]}
                    accessibilityRole="button"
                    key={trackingType}
                    onPress={() => updateTrackingType(trackingType)}
                    style={({ pressed }) => [
                      styles.trackingTypeButton,
                      isSelected && styles.selectedTrackingTypeButton,
                      pressed && styles.pressedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.trackingTypeButtonText,
                        isSelected && styles.selectedTrackingTypeButtonText,
                      ]}
                    >
                      {strings.machineTracking[trackingType]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <MachineMuscleGroupPicker
            onToggleMuscleGroup={toggleMuscleGroup}
            selectedMuscleGroups={machineDraft.muscleGroups}
          />

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>{strings.forms.machine.noteLabel}</Text>
            <TextInput
              accessibilityLabel={strings.forms.machine.noteLabel}
              multiline
              onChangeText={(value) => updateMachineTextDraft('note', value)}
              placeholder={strings.forms.machine.notePlaceholder}
              placeholderTextColor={colors.muted}
              style={[styles.formInput, styles.noteInput]}
              textAlignVertical="top"
              value={machineDraft.note}
            />
          </View>

          <MachineFormActions
            machine={machine}
            onDelete={onDelete}
            onSave={saveMachine}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  formField: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  formInput: {
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  trackingTypeControl: {
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 5,
  },
  trackingTypeButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
  },
  selectedTrackingTypeButton: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
    borderWidth: 1,
  },
  trackingTypeButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  selectedTrackingTypeButtonText: {
    color: colors.primary,
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
  pressedButton: {
    opacity: 0.7,
  },
});
