import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';

type SearchInputProps = {
  onChangeText: (text: string) => void;
  placeholder: string;
  value: string;
};

export function SearchInput({
  onChangeText,
  placeholder,
  value,
}: SearchInputProps) {
  const hasValue = value.length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={value}
      />
      {hasValue ? (
        <Pressable
          accessibilityLabel={strings.accessibility.clearSearch}
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  input: {
    color: colors.text,
    fontSize: 15,
    height: 44,
    paddingLeft: 12,
    paddingRight: 42,
  },
  clearButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    width: 40,
  },
  clearButtonText: {
    color: colors.muted,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
});
