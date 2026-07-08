import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

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
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.focusedContainer]}>
      <Ionicons
        name="search-outline"
        size={19}
        color={isFocused ? colors.primary : colors.muted}
        style={styles.searchIcon}
      />
      <TextInput
        autoCapitalize="none"
        clearButtonMode="while-editing"
        onBlur={() => setIsFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
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
          <Ionicons name="close-circle" size={21} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FBFDFB',
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    height: 44,
    paddingLeft: 12,
    paddingRight: 2,
  },
  focusedContainer: {
    backgroundColor: colors.panel,
    borderColor: '#B7D8C5',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    height: 44,
    paddingLeft: 0,
    paddingRight: 8,
  },
  clearButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
