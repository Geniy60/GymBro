import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { AppUser } from '../../types';

type SettingsScreenProps = {
  currentUser: AppUser | null;
  onBack: () => void;
  onChangeUser: () => void;
};

export function SettingsScreen({
  currentUser,
  onBack,
  onChangeUser,
}: SettingsScreenProps) {
  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.secondaryHeader}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={onBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.secondaryTitle}>{strings.settings.title}</Text>
        </View>

        <View style={styles.settingsRow}>
          <View style={styles.settingsTextBlock}>
            <Text style={styles.settingsLabel}>{strings.settings.currentUser}</Text>
            <Text style={styles.settingsValue}>
              {currentUser?.name ?? strings.settings.noUser}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={strings.accessibility.changeUser}
            onPress={onChangeUser}
            style={({ pressed }) => [
              styles.changeButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.changeButtonText}>
              {strings.settings.changeUser}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    width: 37,
  },
  secondaryTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  settingsRow: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingsTextBlock: {
    flex: 1,
  },
  settingsLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  settingsValue: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  changeButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  changeButtonText: {
    color: colors.panel,
    fontSize: 14,
    fontWeight: '700',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
