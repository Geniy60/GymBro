import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { useAppStyles, useAppTheme } from '../ThemeProvider';
import type { AppThemeColors } from '../theme/colors';

type AppHeaderProps = {
  isRefreshingAllData: boolean;
  onOpenSettings: () => void;
  onRefreshAllData: () => void;
};

export function AppHeader({
  isRefreshingAllData,
  onOpenSettings,
  onRefreshAllData,
}: AppHeaderProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  return (
    <View style={styles.header}>
      <Text style={styles.appTitle}>{strings.app.title}</Text>
      <View style={styles.headerActions}>
        <Pressable
          accessibilityLabel={strings.accessibility.refreshData}
          disabled={isRefreshingAllData}
          onPress={onRefreshAllData}
          style={({ pressed }) => [
            styles.headerIconButton,
            pressed && styles.pressedButton,
          ]}
        >
          {isRefreshingAllData ? (
            <ActivityIndicator color={colors.text} size="small" />
          ) : (
            <Ionicons name="refresh-outline" size={25} color={colors.text} />
          )}
        </Pressable>
        <Pressable
          accessibilityLabel={strings.accessibility.settings}
          onPress={onOpenSettings}
          style={({ pressed }) => [
            styles.headerIconButton,
            pressed && styles.pressedButton,
          ]}
        >
          <Ionicons name="settings-outline" size={26} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  appTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 25,
    fontWeight: '800',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  headerIconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  pressedButton: {
    opacity: 0.7,
  },
  });
}
