import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine } from '../../types';

type MachineFormActionsProps = {
  machine: Machine | null;
  onDelete?: (machine: Machine) => void;
  onSave: () => void;
};

export function MachineFormActions({
  machine,
  onDelete,
  onSave,
}: MachineFormActionsProps) {
  return (
    <>
      <Pressable
        accessibilityLabel={strings.accessibility.saveMachine}
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Text style={styles.saveButtonText}>{strings.actions.save}</Text>
      </Pressable>

      {machine !== null && onDelete !== undefined ? (
        <Pressable
          accessibilityLabel={strings.accessibility.deleteMachine}
          onPress={() => onDelete(machine)}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          <Text style={styles.deleteButtonText}>{strings.actions.delete}</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
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
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.destructiveBorder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 48,
  },
  deleteButtonText: {
    color: colors.destructive,
    fontSize: 16,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
