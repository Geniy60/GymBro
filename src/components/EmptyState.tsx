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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
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
    borderColor: colors.primary,
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
