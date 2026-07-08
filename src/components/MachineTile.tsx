import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';
import type { Machine } from '../types';
import { MachineImageFrame } from './MachineImageFrame';

type MachineTileProps = {
  accessibilityLabel: string;
  machine: Machine;
  onPress: () => void;
  selected?: boolean;
};

export function MachineTile({
  accessibilityLabel,
  machine,
  onPress,
  selected = false,
}: MachineTileProps) {
  const trackingLabel = strings.machineTracking[machine.trackingType];

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
        <View style={styles.badgeRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.trackingBadge,
              machine.trackingType === 'cardio' && styles.cardioBadge,
            ]}
          >
            {trackingLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 215,
    padding: 8,
  },
  selectedTile: {
    backgroundColor: '#EAF7F0',
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
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  badgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 6,
  },
  trackingBadge: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.primary,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cardioBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FBBF24',
    color: '#D97706',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
