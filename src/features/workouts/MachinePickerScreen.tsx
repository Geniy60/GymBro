import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../../components/EmptyState';
import { SearchInput } from '../../components/SearchInput';
import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { Machine, Workout } from '../../types';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';
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
  const keyboardBottomInset = useKeyboardBottomInset();

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <View style={styles.content}>
        <SecondaryScreenHeader
          marginBottom={8}
          onBack={onBack}
          title={strings.workouts.addExerciseTitle}
        />

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
                contentContainerStyle={[
                  styles.machinePickerListContent,
                  keyboardBottomInset > 0 && {
                    paddingBottom: 24 + keyboardBottomInset,
                  },
                ]}
                data={filteredMachines}
                keyboardDismissMode="on-drag"
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
