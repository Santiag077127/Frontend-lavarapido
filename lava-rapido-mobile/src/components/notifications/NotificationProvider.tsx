import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '../../theme/ThemeContext';

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

type Notification = {
  title: string;
  message?: string;
  buttons: AlertButton[];
  type: NotificationType;
};

type NotificationContextValue = {
  show: (title: string, message?: string, buttons?: AlertButton[], type?: NotificationType) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider.');
  }

  return context;
};

let showGlobalNotification: NotificationContextValue['show'] | null = null;

// Mantiene la firma de Alert.alert para no modificar la lógica de cada pantalla.
export const appAlert = {
  alert: (title: string, message?: string, buttons?: AlertButton[], type: NotificationType = 'info') => {
    showGlobalNotification?.(title, message, buttons, type);
  },
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { theme, darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [notification, setNotification] = useState<Notification | null>(null);

  const show = (title: string, message?: string, buttons: AlertButton[] = [], type: NotificationType = 'info') => {
    setNotification({ title, message, buttons, type });
  };

  showGlobalNotification = show;

  const value = useMemo(() => ({ show }), []);
  const alertStyles = {
    success: { background: theme.successBackground, foreground: theme.successText, border: theme.successBorder, icon: 'checkmark-circle-outline' as const },
    error: { background: theme.errorBackground, foreground: theme.errorText, border: theme.errorBorder, icon: 'alert-circle-outline' as const },
    warning: { background: theme.warningBackground, foreground: theme.warningText, border: theme.warningBorder, icon: 'warning-outline' as const },
    info: { background: theme.infoBackground, foreground: theme.infoText, border: theme.infoBorder, icon: 'information-circle-outline' as const },
  };
  const alertStyle = alertStyles[notification?.type ?? 'info'];
  const buttons = notification?.buttons.length
    ? notification.buttons
    : [{ text: t('common.ok') }];

  const dismiss = (button?: AlertButton) => {
    setNotification(null);
    button?.onPress?.();
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <Modal
        visible={Boolean(notification)}
        transparent
        animationType="fade"
        onRequestClose={() => dismiss()}
      >
        <Pressable
          accessible={false}
          style={[styles.backdrop, { backgroundColor: theme.overlay }]}
          onPress={() => dismiss()}
        >
          <Pressable
            style={[styles.card, { backgroundColor: theme.card, shadowColor: theme.shadow }]}
            onPress={(event) => event.stopPropagation()}
            accessibilityViewIsModal
          >
            <View style={[styles.icon, { backgroundColor: alertStyle.background, borderColor: alertStyle.border, borderWidth: 1 }]}>
              <Ionicons
                name={alertStyle.icon}
                size={28}
                color={alertStyle.foreground}
              />
            </View>

            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.title, { color: theme.text }]}>{notification?.title}</Text>
            {notification?.message ? (
              <Text style={[styles.message, { color: theme.textSecondary }]}>
                {notification.message}
              </Text>
            ) : null}

            <View style={styles.actions}>
              {buttons.map((button, index) => {
                const destructive = button.style === 'destructive';
                const secondary = button.style === 'cancel' || index < buttons.length - 1;

                return (
                  <TouchableOpacity
                    key={`${button.text ?? 'action'}-${index}`}
                    accessibilityRole="button"
                    style={[
                      styles.button,
                      secondary
                        ? [styles.secondaryButton, { borderColor: theme.border }]
                        : { backgroundColor: destructive ? theme.errorAction : darkMode ? theme.primaryDark : theme.primary },
                    ]}
                    onPress={() => dismiss(button)}
                    activeOpacity={0.8}
                    accessibilityLabel={button.text ?? t('common.ok')}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: secondary ? theme.text : destructive ? theme.errorOnAction : theme.onPrimary },
                      ]}
                    >
                      {button.text ?? t('common.ok')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </NotificationContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 12,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 8 },
  actions: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 22 },
  button: { flex: 1, minHeight: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  secondaryButton: { borderWidth: 1, backgroundColor: 'transparent' },
  buttonText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
