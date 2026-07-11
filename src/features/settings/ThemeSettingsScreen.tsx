import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '../../strings';
import { useAppStyles, useAppTheme } from '../../ThemeProvider';
import type { AppThemeColors, AppThemeName } from '../../theme/colors';

type ThemeSettingsScreenProps = {
  backgroundColor: string;
  onBack: () => void;
};

const themeOptions: readonly { label: string; value: AppThemeName }[] = [
  { label: strings.settings.lightTheme, value: 'light' },
  { label: strings.settings.darkTheme, value: 'dark' },
];

export function ThemeSettingsScreen({
  backgroundColor,
  onBack,
}: ThemeSettingsScreenProps) {
  const { colors, setThemeName, themeName } = useAppTheme();
  const styles = useAppStyles(createStyles);

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityLabel={strings.accessibility.back}
            onPress={onBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressedButton]}
          >
            <Ionicons color={colors.text} name="arrow-back" size={22} />
          </Pressable>
          <Text style={styles.title}>{strings.settings.themeTitle}</Text>
        </View>

        <View style={styles.options}>
          {themeOptions.map((option) => {
            const isSelected = option.value === themeName;

            return (
              <Pressable
                key={option.value}
                accessibilityLabel={option.label}
                onPress={() => setThemeName(option.value)}
                style={({ pressed }) => [styles.option, pressed && styles.pressedButton]}
              >
                <Text style={styles.optionText}>{option.label}</Text>
                {isSelected ? (
                  <Ionicons color={colors.primary} name="checkmark" size={22} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      marginBottom: 18,
    },
    backButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      height: 37,
      justifyContent: 'center',
      width: 37,
    },
    title: { color: colors.text, flex: 1, fontSize: 20, fontWeight: '700' },
    options: {
      backgroundColor: colors.panel,
      borderColor: colors.border,
      borderRadius: 8,
      borderWidth: 1,
      overflow: 'hidden',
    },
    option: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 54,
      paddingHorizontal: 14,
    },
    optionText: { color: colors.text, fontSize: 16, fontWeight: '700' },
    pressedButton: { opacity: 0.7 },
  });
}
