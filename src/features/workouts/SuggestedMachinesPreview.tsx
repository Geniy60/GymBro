import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MachineTile } from '../../components/MachineTile';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine } from '../../types';

type SuggestedMachinesPreviewProps = {
  canSuggest: boolean;
  hasSuggestAttempt: boolean;
  onAddSuggestedMachines: () => void;
  suggestedMachines: Machine[];
};

export function SuggestedMachinesPreview({
  canSuggest,
  hasSuggestAttempt,
  onAddSuggestedMachines,
  suggestedMachines,
}: SuggestedMachinesPreviewProps) {
  if (suggestedMachines.length === 0) {
    return (
      <Text style={styles.helperText}>
        {getSuggestEmptyMessage({ canSuggest, hasSuggestAttempt })}
      </Text>
    );
  }

  return (
    <View style={styles.suggestPreviewBlock}>
      <Text style={styles.suggestSectionTitle}>
        {strings.workouts.suggestPreviewTitle}
      </Text>
      <View style={styles.suggestPreviewGrid}>
        {suggestedMachines.map((machine) => (
          <View key={machine.id} style={styles.suggestPreviewItem}>
            <MachineTile
              accessibilityLabel={strings.workouts.suggestedMachine(machine.name)}
              machine={machine}
              onPress={noop}
            />
          </View>
        ))}
        {suggestedMachines.length % 2 === 1 ? (
          <View style={styles.suggestPreviewItem} />
        ) : null}
      </View>
      <Pressable
        accessibilityLabel={strings.workouts.addSuggestedMachines}
        onPress={onAddSuggestedMachines}
        style={({ pressed }) => [
          styles.suggestAddButton,
          pressed && styles.pressedButton,
        ]}
      >
        <Text style={styles.suggestAddButtonText}>
          {strings.workouts.addSuggestedMachines}
        </Text>
      </Pressable>
    </View>
  );
}

function getSuggestEmptyMessage({
  canSuggest,
  hasSuggestAttempt,
}: {
  canSuggest: boolean;
  hasSuggestAttempt: boolean;
}): string {
  if (!canSuggest) {
    return strings.workouts.suggestPickMusclesHint;
  }

  if (hasSuggestAttempt) {
    return strings.workouts.suggestNoMatches;
  }

  return strings.workouts.suggestPreviewEmpty;
}

function noop() {}

const styles = StyleSheet.create({
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  suggestSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  suggestPreviewBlock: {
    gap: 8,
  },
  suggestPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestPreviewItem: {
    flexBasis: '48.5%',
    flexGrow: 1,
    maxWidth: '48.5%',
  },
  suggestAddButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 44,
  },
  suggestAddButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
