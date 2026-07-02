import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MachineTile } from '../../components/MachineTile';
import { muscleGroups } from '../../muscleGroups';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine, MuscleGroup } from '../../types';

type MachineSuggestScreenProps = {
  backgroundColor: string;
  hasSuggestAttempt: boolean;
  onAddSuggestedMachines: () => void;
  onBack: () => void;
  onChangeSuggestMachineCount: (count: number) => void;
  onSuggestMachines: () => void;
  onToggleSuggestMuscleGroup: (muscleGroup: MuscleGroup) => void;
  selectedSuggestMuscleGroups: MuscleGroup[];
  suggestMachineCount: number;
  suggestedMachines: Machine[];
};

export function MachineSuggestScreen({
  backgroundColor,
  hasSuggestAttempt,
  onAddSuggestedMachines,
  onBack,
  onChangeSuggestMachineCount,
  onSuggestMachines,
  onToggleSuggestMuscleGroup,
  selectedSuggestMuscleGroups,
  suggestMachineCount,
  suggestedMachines,
}: MachineSuggestScreenProps) {
  const canSuggest = selectedSuggestMuscleGroups.length > 0;

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <View style={styles.content}>
        <View style={styles.secondaryHeader}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.secondaryTitle}>
            {strings.workouts.suggestMachinesTitle}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.suggestContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.suggestSectionTitle}>
            {strings.workouts.suggestMuscleGroupsTitle}
          </Text>
          <View style={styles.suggestChipGrid}>
            {muscleGroups.map((muscleGroup) => {
              const isSelected = selectedSuggestMuscleGroups.includes(muscleGroup);

              return (
                <Pressable
                  accessibilityLabel={strings.workouts.toggleSuggestMuscleGroup(
                    strings.muscleGroups.labels[muscleGroup],
                  )}
                  key={muscleGroup}
                  onPress={() => onToggleSuggestMuscleGroup(muscleGroup)}
                  style={({ pressed }) => [
                    styles.suggestChip,
                    isSelected && styles.selectedSuggestChip,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.suggestChipText,
                      isSelected && styles.selectedSuggestChipText,
                    ]}
                  >
                    {strings.muscleGroups.labels[muscleGroup]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.suggestSectionTitle}>
            {strings.workouts.suggestCountTitle}
          </Text>
          <View style={styles.suggestCountRow}>
            {[3, 4, 5, 6].map((count) => {
              const isSelected = suggestMachineCount === count;

              return (
                <Pressable
                  accessibilityLabel={strings.workouts.selectSuggestMachineCount(count)}
                  key={count}
                  onPress={() => onChangeSuggestMachineCount(count)}
                  style={({ pressed }) => [
                    styles.countButton,
                    isSelected && styles.selectedCountButton,
                    pressed && styles.pressedButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.countButtonText,
                      isSelected && styles.selectedCountButtonText,
                    ]}
                  >
                    {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityLabel={
              hasSuggestAttempt
                ? strings.workouts.resuggestMachines
                : strings.workouts.suggestMachinesButton
            }
            disabled={!canSuggest}
            onPress={onSuggestMachines}
            style={({ pressed }) => [
              styles.suggestPrimaryButton,
              !canSuggest && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
          >
            <LinearGradient
              colors={['#7C3AED', '#A855F7', '#EC4899']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.suggestPrimaryGradient}
            >
              <Ionicons name="sparkles-outline" size={20} color={colors.panel} />
              <Text style={styles.suggestPrimaryButtonText}>
                {hasSuggestAttempt
                  ? strings.workouts.resuggestMachines
                  : strings.workouts.suggestMachinesButton}
              </Text>
            </LinearGradient>
          </Pressable>

          {suggestedMachines.length === 0 ? (
            <Text style={styles.helperText}>
              {getSuggestEmptyMessage({ canSuggest, hasSuggestAttempt })}
            </Text>
          ) : (
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
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    width: 37,
  },
  secondaryTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  suggestContent: {
    gap: 14,
    paddingBottom: 28,
  },
  suggestSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  suggestChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestChip: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  selectedSuggestChip: {
    backgroundColor: '#EAF7EF',
    borderColor: colors.primary,
  },
  suggestChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedSuggestChipText: {
    color: colors.primary,
  },
  suggestCountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 50,
  },
  selectedCountButton: {
    backgroundColor: '#EAF7EF',
    borderColor: colors.primary,
  },
  countButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  selectedCountButtonText: {
    color: colors.primary,
  },
  suggestPrimaryButton: {
    borderRadius: 8,
    minHeight: 48,
    overflow: 'hidden',
  },
  suggestPrimaryGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
  },
  suggestPrimaryButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.45,
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
