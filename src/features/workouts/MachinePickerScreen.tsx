import { Ionicons } from '@expo/vector-icons';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../../components/EmptyState';
import { SearchInput } from '../../components/SearchInput';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine, Workout } from '../../types';
import { MachinePickerButton } from './MachinePickerButton';

type MachinePickerScreenProps = {
  backgroundColor: string;
  filteredMachines: Machine[];
  machineSearchText: string;
  machines: Machine[];
  onAddExercise: (machine: Machine) => void;
  onBack: () => void;
  onChangeSearchText: (text: string) => void;
  workout: Workout;
};

export function MachinePickerScreen({
  backgroundColor,
  filteredMachines,
  machineSearchText,
  machines,
  onAddExercise,
  onBack,
  onChangeSearchText,
  workout,
}: MachinePickerScreenProps) {
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
            {strings.workouts.addExerciseTitle}
          </Text>
        </View>

        {machines.length === 0 ? (
          <EmptyState
            message={strings.workouts.noMachinesMessage}
            title={strings.workouts.noMachinesTitle}
          />
        ) : (
          <>
            <View style={styles.machineSearchRow}>
              <SearchInput
                onChangeText={onChangeSearchText}
                placeholder={strings.workouts.machineSearchPlaceholder}
                value={machineSearchText}
              />
            </View>

            {filteredMachines.length === 0 ? (
              <Text style={styles.helperText}>{strings.empty.filtered.title}</Text>
            ) : (
              <FlatList
                columnWrapperStyle={styles.machinePickerRow}
                contentContainerStyle={styles.machinePickerListContent}
                data={filteredMachines}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(machine) => machine.id}
                numColumns={2}
                renderItem={({ item: machine }) => (
                  <View style={styles.machinePickerItem}>
                    <MachinePickerButton
                      machine={machine}
                      onPress={() => onAddExercise(machine)}
                      workout={workout}
                    />
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.machinePickerList}
              />
            )}
          </>
        )}
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
  machineSearchRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  machinePickerList: {
    flex: 1,
  },
  machinePickerListContent: {
    paddingBottom: 24,
    rowGap: 10,
  },
  machinePickerRow: {
    gap: 10,
  },
  machinePickerItem: {
    flex: 1,
    maxWidth: '48.5%',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
