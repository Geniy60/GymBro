import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { strings } from './src/strings';

type MainTab = 'machines' | 'workouts';

type TabConfig = {
  key: MainTab;
  label: string;
  emptyTitle: string;
  emptyMessage: string;
  searchPlaceholder: string;
};

const tabs: TabConfig[] = [
  {
    key: 'machines',
    label: strings.tabs.machines,
    emptyTitle: strings.empty.machines.title,
    emptyMessage: strings.empty.machines.message,
    searchPlaceholder: strings.search.machines,
  },
  {
    key: 'workouts',
    label: strings.tabs.workouts,
    emptyTitle: strings.empty.workouts.title,
    emptyMessage: strings.empty.workouts.message,
    searchPlaceholder: strings.search.workouts,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('machines');
  const [searchText, setSearchText] = useState('');

  const selectedTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>{strings.app.title}</Text>
          <Pressable
            accessibilityLabel={strings.accessibility.settings}
            style={({ pressed }) => [
              styles.settingsButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="settings-outline" size={26} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key);
                  setSearchText('');
                }}
                style={({ pressed }) => [
                  styles.tab,
                  isActive && styles.activeTab,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.content}>
          <View style={styles.toolbar}>
            <TextInput
              accessibilityLabel={strings.accessibility.search}
              onChangeText={setSearchText}
              placeholder={selectedTab.searchPlaceholder}
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
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{selectedTab.emptyTitle}</Text>
                <Text style={styles.emptyMessage}>{selectedTab.emptyMessage}</Text>
              </View>
            }
            renderItem={({ item }: { item: string }) => (
              <Text style={styles.listItem}>{item}</Text>
            )}
            style={styles.list}
          />
        </View>

        <StatusBar style="dark" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const colors = {
  background: '#F7F8FA',
  panel: '#FFFFFF',
  text: '#17212B',
  muted: '#6B7280',
  border: '#D7DEE8',
  active: '#E5F2ED',
  activeText: '#0D5C46',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 5,
  },
  appTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
  },
  settingsButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 44,
  },
  pressedButton: {
    opacity: 0.7,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  activeTab: {
    backgroundColor: colors.active,
    borderColor: colors.activeText,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  activeTabLabel: {
    color: colors.activeText,
  },
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
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
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
});
