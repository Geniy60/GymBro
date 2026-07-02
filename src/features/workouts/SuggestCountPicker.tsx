import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';

type SuggestCountPickerProps = {
  onChangeCount: (count: number) => void;
  selectedCount: number;
};

const suggestCounts = [3, 4, 5, 6];

export function SuggestCountPicker({
  onChangeCount,
  selectedCount,
}: SuggestCountPickerProps) {
  return (
    <>
      <Text style={styles.suggestSectionTitle}>
        {strings.workouts.suggestCountTitle}
      </Text>
      <View style={styles.suggestCountRow}>
        {suggestCounts.map((count) => {
          const isSelected = selectedCount === count;

          return (
            <Pressable
              accessibilityLabel={strings.workouts.selectSuggestMachineCount(count)}
              key={count}
              onPress={() => onChangeCount(count)}
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
    </>
  );
}

const styles = StyleSheet.create({
  suggestSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
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
  pressedButton: {
    opacity: 0.7,
  },
});
