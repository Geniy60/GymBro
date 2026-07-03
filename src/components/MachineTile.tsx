import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';
import type { Machine } from '../types';
import { MachineImageFrame } from './MachineImageFrame';

type MachineTileProps = {
  accessibilityLabel: string;
  machine: Machine;
  meta?: string;
  onPress: () => void;
  selected?: boolean;
};

export function MachineTile({
  accessibilityLabel,
  machine,
  meta,
  onPress,
  selected = false,
}: MachineTileProps) {
  const fallbackMeta =
    machine.muscleGroups.length === 0
      ? ''
      : machine.muscleGroups
          .map((muscleGroup) => strings.muscleGroups.labels[muscleGroup])
          .join(', ');
  const metaText = meta ?? fallbackMeta;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        selected && styles.selectedTile,
        pressed && styles.pressedButton,
      ]}
    >
      <MachineImageFrame machineId={machine.id} style={styles.tileImage} />
      <View style={styles.textBlock}>
        <Text numberOfLines={2} style={styles.title}>
          {machine.name}
        </Text>
        {metaText.length > 0 ? (
          <Text numberOfLines={1} style={styles.meta}>
            {metaText}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 215,
    padding: 8,
  },
  selectedTile: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.primary,
  },
  tileImage: {
    height: 145,
    width: '100%',
  },
  textBlock: {
    paddingTop: 8,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
