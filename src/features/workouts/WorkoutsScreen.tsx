import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';

export function WorkoutsScreen() {
  const [searchText, setSearchText] = useState('');

  return (
    <View style={styles.content}>
      <View style={styles.toolbar}>
        <TextInput
          accessibilityLabel={strings.accessibility.search}
          onChangeText={setSearchText}
          placeholder={strings.search.workouts}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          value={searchText}
        />
        {searchText.length > 0 ? (
          <Pressable
            accessibilityLabel={strings.accessibility.clearSearch}
            onPress={() => setSearchText('')}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={[]}
        keyExtractor={(item: string) => item}
        ListEmptyComponent={
          <EmptyState
            message={strings.empty.workouts.message}
            title={strings.empty.workouts.title}
          />
        }
        renderItem={({ item }: { item: string }) => (
          <Text style={styles.listItem}>{item}</Text>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  toolbar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    height: 44,
    paddingHorizontal: 14,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    gap: 10,
    paddingBottom: 24,
  },
  listItem: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
