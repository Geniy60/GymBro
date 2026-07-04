import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';

type RestTimerControlProps = {
  isActive: boolean;
  onCancel: () => void;
  onStart: () => void;
  remainingSeconds: number;
};

export function RestTimerControl({
  isActive,
  onCancel,
  onStart,
  remainingSeconds,
}: RestTimerControlProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel={strings.accessibility.startRestTimer}
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          isActive && styles.activeStartButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Ionicons
          color={isActive ? colors.primary : colors.panel}
          name="timer-outline"
          size={18}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.startButtonText,
            isActive && styles.activeStartButtonText,
          ]}
        >
          {isActive
            ? strings.restTimer.activeLabel(formatRemainingTime(remainingSeconds))
            : strings.restTimer.startLabel}
        </Text>
      </Pressable>

      {isActive ? (
        <Pressable
          accessibilityLabel={strings.accessibility.cancelRestTimer}
          onPress={onCancel}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons color={colors.destructive} name="close" size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}

function formatRemainingTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 12,
  },
  activeStartButton: {
    backgroundColor: colors.panel,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  startButtonText: {
    color: colors.panel,
    fontSize: 14,
    fontWeight: '800',
  },
  activeStartButtonText: {
    color: colors.primary,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.destructiveBorder,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
