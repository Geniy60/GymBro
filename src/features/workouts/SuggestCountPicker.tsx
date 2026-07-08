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
    <View style={styles.suggestSection}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  suggestSection: {
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 12,
  },
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
    backgroundColor: colors.background,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: 'center',
    minWidth: 0,
  },
  selectedCountButton: {
    backgroundColor: '#EAF7F0',
    borderColor: '#B7D8C5',
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
