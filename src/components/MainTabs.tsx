import { Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';
import type { MainTab } from '../types';

type TabConfig = {
  key: MainTab;
  label: string;
};

type MainTabsProps = {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
};

const tabs: TabConfig[] = [
  {
    key: 'workouts',
    label: strings.tabs.workouts,
  },
  {
    key: 'stats',
    label: strings.tabs.stats,
  },
  {
    key: 'machines',
    label: strings.tabs.machines,
  },
];

export function MainTabs({ activeTab, onSelectTab }: MainTabsProps) {
  return (
    <View style={styles.tabRow}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={tab.key}
            onPress={() => onSelectTab(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              tab.key === 'machines' && styles.machinesTab,
              tab.key === 'stats' && styles.statsTab,
              tab.key === 'workouts' && styles.workoutsTab,
              isActive && styles.activeTab,
              pressed && styles.pressedButton,
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                tab.key === 'machines' && styles.machinesTabLabel,
                tab.key === 'stats' && styles.statsTabLabel,
                tab.key === 'workouts' && styles.workoutsTabLabel,
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
    marginHorizontal: 20,
    marginTop: 6,
    padding: 4,
  },
  tab: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: 6,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  machinesTab: {
    backgroundColor: '#CFF7D3',
  },
  workoutsTab: {
    backgroundColor: '#DDD6FE',
  },
  statsTab: {
    backgroundColor: '#FEF3C7',
  },
  activeTab: {
    borderColor: colors.text,
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  machinesTabLabel: {
    color: '#166534',
  },
  workoutsTabLabel: {
    color: '#6D28D9',
  },
  statsTabLabel: {
    color: '#92400E',
  },
  activeTabLabel: {
    color: colors.text,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
