import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SecondaryScreenHeader } from '../../components/SecondaryScreenHeader';
import {
  loadRestTimerSeconds,
  saveRestTimerSeconds,
} from '../../storage/restTimerSettingsStorage';
import { strings } from '../../strings';
import { colors } from '../../theme/colors';
import { useKeyboardBottomInset } from '../../useKeyboardBottomInset';

type RestTimerSettingsScreenProps = {
  backgroundColor: string;
  onBack: () => void;
};

export function RestTimerSettingsScreen({
  backgroundColor,
  onBack,
}: RestTimerSettingsScreenProps) {
  const [secondsText, setSecondsText] = useState('');
  const [errorText, setErrorText] = useState('');
  const keyboardBottomInset = useKeyboardBottomInset();

  useEffect(() => {
    void loadInitialValue();
  }, []);

  async function loadInitialValue() {
    setSecondsText(String(await loadRestTimerSeconds()));
  }

  async function saveSettings() {
    const parsedSeconds = Number(secondsText.trim());

    if (!Number.isInteger(parsedSeconds) || parsedSeconds <= 0) {
      setErrorText(strings.restTimer.invalidSeconds);
      return;
    }

    await saveRestTimerSeconds(parsedSeconds);
    onBack();
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={[styles.safeArea, { backgroundColor }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.content,
          keyboardBottomInset > 0 && { paddingBottom: keyboardBottomInset },
        ]}
      >
        <SecondaryScreenHeader
          marginBottom={18}
          onBack={onBack}
          title={strings.restTimer.settingTitle}
        />

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>{strings.restTimer.secondsLabel}</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={(value) => {
                setSecondsText(value);
                setErrorText('');
              }}
              placeholder={strings.restTimer.secondsPlaceholder}
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={secondsText}
            />
            {errorText.length > 0 ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {errorText}
              </Text>
            ) : null}
          </View>

          <Pressable
            accessibilityLabel={strings.accessibility.saveRestTimerSettings}
            onPress={() => {
              void saveSettings();
            }}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.saveButtonText}>{strings.actions.save}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  formCard: {
    backgroundColor: colors.panel,
    borderColor: '#E4E9F2',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#FBFDFB',
    borderColor: '#DCE9E2',
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    height: 48,
    paddingHorizontal: 14,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderColor: '#B7D8C5',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: colors.panel,
    fontSize: 16,
    fontWeight: '800',
  },
  pressedButton: {
    opacity: 0.7,
  },
});
