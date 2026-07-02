import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine, MuscleGroup } from '../../types';
import { SuggestCountPicker } from './SuggestCountPicker';
import { SuggestedMachinesPreview } from './SuggestedMachinesPreview';
import { SuggestMuscleGroupPicker } from './SuggestMuscleGroupPicker';

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
        <SecondaryScreenHeader
          marginBottom={8}
          onBack={onBack}
          title={strings.workouts.suggestMachinesTitle}
        />

        <ScrollView
          contentContainerStyle={styles.suggestContent}
          showsVerticalScrollIndicator={false}
        >
          <SuggestMuscleGroupPicker
            onToggleMuscleGroup={onToggleSuggestMuscleGroup}
            selectedMuscleGroups={selectedSuggestMuscleGroups}
          />

          <SuggestCountPicker
            onChangeCount={onChangeSuggestMachineCount}
            selectedCount={suggestMachineCount}
          />

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

          <SuggestedMachinesPreview
            canSuggest={canSuggest}
            hasSuggestAttempt={hasSuggestAttempt}
            onAddSuggestedMachines={onAddSuggestedMachines}
            suggestedMachines={suggestedMachines}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  suggestContent: {
    gap: 14,
    paddingBottom: 28,
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
  pressedButton: {
    opacity: 0.7,
  },
});
