import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine } from '../../types';

type MachineCardProps = {
  machine: Machine;
  onDelete: () => void;
  onEdit: () => void;
};

export function MachineCard({ machine, onDelete, onEdit }: MachineCardProps) {
  return (
    <Pressable
      accessibilityLabel={strings.accessibility.editMachine}
      onPress={onEdit}
      style={({ pressed }) => [styles.card, pressed && styles.pressedButton]}
    >
      <View style={styles.cardTextBlock}>
        <Text style={styles.cardTitle}>{machine.name}</Text>
        {machine.muscleGroup.length > 0 ? (
          <Text style={styles.cardMeta}>{machine.muscleGroup}</Text>
        ) : null}
        {machine.note.length > 0 ? (
          <Text numberOfLines={2} style={styles.cardNote}>
            {machine.note}
          </Text>
        ) : null}
      </View>
      <View style={styles.cardActions}>
        <Pressable
          accessibilityLabel={strings.accessibility.editMachine}
          onPress={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          style={({ pressed }) => [
            styles.cardActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="pencil" size={19} color={colors.text} />
        </Pressable>
        <Pressable
          accessibilityLabel={strings.accessibility.deleteMachine}
          onPress={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          style={({ pressed }) => [
            styles.cardActionButton,
            styles.destructiveActionButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="trash-outline" size={19} color={colors.destructive} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cardTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  cardNote: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 5,
  },
  cardActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  cardActionButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  destructiveActionButton: {
    backgroundColor: colors.errorBackground,
    borderColor: colors.destructiveBorder,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
