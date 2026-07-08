import { Ionicons } from '@expo/vector-icons';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import type { AppUser } from '../../types';

type SettingsScreenProps = {
  backgroundColor: string;
  currentUser: AppUser | null;
  onBack: () => void;
  onOpenBodyMeasurements: () => void;
  onOpenRestTimerSettings: () => void;
  onChangeUser: () => void;
};

export function SettingsScreen({
  backgroundColor,
  currentUser,
  onBack,
  onOpenBodyMeasurements,
  onOpenRestTimerSettings,
  onChangeUser,
}: SettingsScreenProps) {
  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
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
          <View style={styles.settingsIconBadge}>
            <Ionicons color={colors.primary} name="person-outline" size={20} />
          </View>
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

        <SettingsActionRow
          accessibilityLabel={strings.accessibility.restTimerSettings}
          description={strings.settings.restTimerDescription}
          iconName="timer-outline"
          onPress={onOpenRestTimerSettings}
          title={strings.settings.restTimer}
        />

        <SettingsActionRow
          accessibilityLabel={strings.accessibility.bodyMeasurements}
          description={strings.settings.bodyMeasurementsDescription}
          iconName="analytics-outline"
          onPress={onOpenBodyMeasurements}
          title={strings.settings.bodyMeasurements}
        />
      </View>
    </SafeAreaView>
  );
}

function SettingsActionRow({
  accessibilityLabel,
  description,
  iconName,
  onPress,
  title,
}: {
  accessibilityLabel: string;
  description: string;
  iconName: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsActionRow,
        pressed && styles.pressedButton,
      ]}
    >
      <View style={styles.settingsIconBadge}>
        <Ionicons color={colors.primary} name={iconName} size={20} />
      </View>
      <View style={styles.settingsTextBlock}>
        <Text style={styles.settingsLabel}>{title}</Text>
        <Text style={styles.settingsValue}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
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
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  settingsActionRow: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  settingsIconBadge: {
    alignItems: 'center',
    backgroundColor: '#EAF7F0',
    borderRadius: 8,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  settingsTextBlock: {
    flex: 1,
  },
  settingsLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  settingsValue: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  changeButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  changeButtonText: {
    color: colors.panel,
    fontSize: 14,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
