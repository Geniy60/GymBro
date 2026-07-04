import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';

const restTimerColor = '#D97706';
const restTimerBorderColor = '#FCD34D';
const restTimerActiveBackgroundColor = '#FFFBEB';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type WorkoutSessionFooterProps = {
  onFinish: () => void;
  onRestTimerPress: () => void;
  onSave: () => void;
  restTimerLabel: ReactNode;
  restTimerActive: boolean;
  saveStatus: SaveStatus;
};

export function WorkoutSessionFooter({
  onFinish,
  onRestTimerPress,
  onSave,
  restTimerActive,
  restTimerLabel,
  saveStatus,
}: WorkoutSessionFooterProps) {
  const isSaving = saveStatus === 'saving';

  return (
    <>
      {saveStatus !== 'idle' ? (
        <Text
          accessibilityRole={saveStatus === 'error' ? 'alert' : undefined}
          style={[
            styles.saveStatusText,
            saveStatus === 'error' && styles.saveErrorText,
          ]}
        >
          {getSaveStatusText(saveStatus)}
        </Text>
      ) : null}

      <View style={styles.footerActions}>
        <Pressable
          accessibilityLabel={
            restTimerActive
              ? strings.accessibility.cancelRestTimer
              : strings.accessibility.startRestTimer
          }
          onPress={onRestTimerPress}
          style={({ pressed }) => [
            styles.footerButton,
            styles.restTimerButton,
            restTimerActive && styles.activeRestTimerButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.restTimerButtonText,
              restTimerActive && styles.activeRestTimerButtonText,
            ]}
          >
            {restTimerLabel}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={strings.accessibility.saveWorkout}
          disabled={isSaving}
          onPress={onSave}
          style={({ pressed }) => [
            styles.footerButton,
            styles.saveDraftButton,
            isSaving && styles.disabledButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.saveDraftButtonText}>{strings.actions.save}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={strings.accessibility.finishWorkout}
          disabled={isSaving}
          onPress={onFinish}
          style={({ pressed }) => [
            styles.footerButton,
            styles.finishButton,
            isSaving && styles.disabledButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Text style={styles.finishButtonText}>{strings.actions.finish}</Text>
        </Pressable>
      </View>
    </>
  );
}

function getSaveStatusText(saveStatus: SaveStatus): string {
  if (saveStatus === 'saving') {
    return strings.workouts.saving;
  }

  if (saveStatus === 'saved') {
    return strings.workouts.saved;
  }

  if (saveStatus === 'error') {
    return strings.workouts.saveFailed;
  }

  return '';
}

const styles = StyleSheet.create({
  saveStatusText: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    textAlign: 'center',
  },
  saveErrorText: {
    borderColor: colors.destructiveBorder,
    color: colors.destructive,
  },
  footerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 44,
  },
  footerButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 6,
  },
  restTimerButton: {
    backgroundColor: restTimerColor,
  },
  activeRestTimerButton: {
    backgroundColor: restTimerActiveBackgroundColor,
    borderColor: restTimerBorderColor,
    borderWidth: 1,
  },
  restTimerButtonText: {
    color: colors.panel,
    fontSize: 13,
    fontWeight: '800',
  },
  activeRestTimerButtonText: {
    color: restTimerColor,
  },
  saveDraftButton: {
    backgroundColor: colors.panel,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  saveDraftButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  finishButton: {
    backgroundColor: colors.primary,
  },
  finishButtonText: {
    color: colors.panel,
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
