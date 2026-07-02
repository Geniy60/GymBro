import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { strings } from '../strings';
import { colors } from '../theme/colors';

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

const styles = StyleSheet.create({
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerIconButton: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    width: 44,
  },
  pressedButton: {
    opacity: 0.7,
  },
});
