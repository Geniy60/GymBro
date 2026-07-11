import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  type AppAlertButton,
  type AppAlertConfig,
  subscribeToAppAlerts,
} from '../appAlert';
import { strings } from '../strings';
import { useAppStyles } from '../ThemeProvider';
import type { AppThemeColors } from '../theme/colors';

export function AppAlertHost() {
  const styles = useAppStyles(createStyles);
  const [alertConfig, setAlertConfig] = useState<AppAlertConfig | null>(null);
  const buttons = useMemo(
    () =>
      alertConfig?.buttons && alertConfig.buttons.length > 0
        ? alertConfig.buttons
        : [{ text: strings.actions.ok }],
    [alertConfig],
  );

  useEffect(() => subscribeToAppAlerts(setAlertConfig), []);

  function closeAlert(button?: AppAlertButton) {
    setAlertConfig(null);
    button?.onPress?.();
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={() => closeAlert(getCancelButton(buttons))}
      transparent
      visible={alertConfig !== null}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{alertConfig?.title}</Text>
          {alertConfig?.message ? (
            <Text style={styles.message}>{alertConfig.message}</Text>
          ) : null}
          <View style={styles.actions}>
            {buttons.map((button) => {
              const isCancel = button.style === 'cancel';
              const isDestructive = button.style === 'destructive';

              return (
                <Pressable
                  key={button.text}
                  onPress={() => closeAlert(button)}
                  style={[
                    styles.button,
                    isCancel ? styles.cancelButton : null,
                    isDestructive ? styles.destructiveButton : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel ? styles.cancelButtonText : null,
                      isDestructive ? styles.destructiveButtonText : null,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getCancelButton(buttons: AppAlertButton[]) {
  return buttons.find((button) => button.style === 'cancel');
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.46)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.appBackground,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 420,
    padding: 18,
    width: '100%',
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 10,
  },
  actions: {
    gap: 10,
    marginTop: 18,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cancelButton: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
  },
  destructiveButton: {
    backgroundColor: colors.panel,
    borderColor: colors.destructiveBorder,
    borderWidth: 1,
  },
  buttonText: {
    color: colors.panel,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: colors.muted,
  },
  destructiveButtonText: {
    color: colors.destructive,
  },
  });
}
