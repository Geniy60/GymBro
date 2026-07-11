import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MachineTile } from '../../components/MachineTile';
import { strings } from '../../strings';
import { useAppStyles, useAppTheme } from '../../ThemeProvider';
import type { AppThemeColors } from '../../theme/colors';
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
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  if (suggestedMachines.length === 0) {
    return (
      <View style={styles.helperBlock}>
        <Ionicons name="sparkles-outline" size={20} color={colors.primary} />
        <Text style={styles.helperText}>
          {getSuggestEmptyMessage({ canSuggest, hasSuggestAttempt })}
        </Text>
      </View>
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
        <Ionicons name="add" size={21} color={colors.panel} />
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

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  helperBlock: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  helperText: {
    color: colors.muted,
    flex: 1,
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
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
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
}
