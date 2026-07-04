import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type WorkoutSessionFooterProps = {
  onFinish: () => void;
  onSave: () => void;
  saveStatus: SaveStatus;
};

export function WorkoutSessionFooter({
  onFinish,
  onSave,
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
    minHeight: 48,
  },
  footerButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveDraftButton: {
    backgroundColor: colors.panel,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  saveDraftButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  finishButton: {
    backgroundColor: colors.primary,
  },
  finishButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
