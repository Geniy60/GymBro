import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MachineImageFrame } from '../../components/MachineImageFrame';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine } from '../../types';

type MachineCardProps = {
  machine: Machine;
  onEdit: () => void;
};

export function MachineCard({ machine, onEdit }: MachineCardProps) {
  return (
    <Pressable
      accessibilityLabel={strings.accessibility.editMachine}
      onPress={onEdit}
      style={({ pressed }) => [styles.card, pressed && styles.pressedButton]}
    >
      <MachineImageFrame machineId={machine.id} style={styles.cardImage} />
      <View style={styles.cardTextBlock}>
        <Text style={styles.cardTitle}>{machine.name}</Text>
        {machine.muscleGroups.length > 0 ? (
          <Text numberOfLines={1} style={styles.cardMeta}>
            {machine.muscleGroups
              .map((muscleGroup) => strings.muscleGroups.labels[muscleGroup])
              .join(', ')}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 174,
    padding: 8,
  },
  cardTextBlock: {
    paddingTop: 8,
  },
  cardImage: {
    height: 104,
    width: '100%',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
