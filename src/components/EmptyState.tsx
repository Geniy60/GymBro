import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type EmptyStateProps = {
  message: string;
  onReset?: () => void;
  resetLabel?: string;
  title: string;
};

export function EmptyState({
  message,
  onReset,
  resetLabel,
  title,
}: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={styles.emptyVisual}
      >
        <View style={styles.emptyVisualInner}>
          <Ionicons name="file-tray-outline" size={28} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {onReset !== undefined && resetLabel !== undefined ? (
        <Pressable
          onPress={onReset}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.resetButtonText}>{resetLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 30,
  },
  emptyVisual: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderColor: '#D5EBDD',
    borderRadius: 8,
    borderWidth: 1,
    height: 58,
    justifyContent: 'center',
    marginBottom: 14,
    width: 58,
  },
  emptyVisualInner: {
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
  resetButton: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 42,
    paddingHorizontal: 16,
  },
  resetButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
