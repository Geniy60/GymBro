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
import type { Machine, MachineDraft } from '../../types';

type MachineFormScreenProps = {
  machine: Machine | null;
  onBack: () => void;
  onSave: (machine: Machine) => void;
};

const emptyMachineDraft: MachineDraft = {
  name: '',
  muscleGroup: '',
  note: '',
};

export function MachineFormScreen({
  machine,
  onBack,
  onSave,
}: MachineFormScreenProps) {
  const [machineDraft, setMachineDraft] = useState<MachineDraft>(() =>
    machine === null
      ? emptyMachineDraft
      : {
          name: machine.name,
          muscleGroup: machine.muscleGroup,
          note: machine.note,
        },
  );
  const [machineNameError, setMachineNameError] = useState('');

  const isEditingMachine = machine !== null;

  function updateMachineDraft(field: keyof MachineDraft, value: string) {
    setMachineDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    if (field === 'name' && value.trim().length > 0) {
      setMachineNameError('');
    }
  }

  function saveMachine() {
    const nextDraft: MachineDraft = {
      name: machineDraft.name.trim(),
      muscleGroup: machineDraft.muscleGroup.trim(),
      note: machineDraft.note.trim(),
    };

    if (nextDraft.name.length === 0) {
      setMachineNameError(strings.forms.machine.errors.nameRequired);
      return;
    }

    onSave({
      id: machine?.id ?? String(Date.now()),
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
            {isEditingMachine
              ? strings.forms.machine.editTitle
              : strings.forms.machine.addTitle}
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>{strings.forms.machine.nameLabel}</Text>
          <TextInput
            accessibilityLabel={strings.forms.machine.nameLabel}
            autoFocus
            onChangeText={(value) => updateMachineDraft('name', value)}
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
          <Text style={styles.fieldLabel}>{strings.forms.machine.muscleGroupLabel}</Text>
          <TextInput
            accessibilityLabel={strings.forms.machine.muscleGroupLabel}
            onChangeText={(value) => updateMachineDraft('muscleGroup', value)}
            placeholder={strings.forms.machine.muscleGroupPlaceholder}
            placeholderTextColor={colors.muted}
            style={styles.formInput}
            value={machineDraft.muscleGroup}
          />
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>{strings.forms.machine.noteLabel}</Text>
          <TextInput
            accessibilityLabel={strings.forms.machine.noteLabel}
            multiline
            onChangeText={(value) => updateMachineDraft('note', value)}
            placeholder={strings.forms.machine.notePlaceholder}
            placeholderTextColor={colors.muted}
            style={[styles.formInput, styles.noteInput]}
            textAlignVertical="top"
            value={machineDraft.note}
          />
        </View>

        <Pressable
          accessibilityLabel={strings.accessibility.saveMachine}
          onPress={saveMachine}
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
