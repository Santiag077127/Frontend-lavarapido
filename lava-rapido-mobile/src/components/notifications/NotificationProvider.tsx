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

import { ThemeContext } from '../../theme/ThemeContext';

type AlertButton = {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

type Notification = {
  title: string;
  message?: string;
  buttons: AlertButton[];
};

type NotificationContextValue = {
  show: (title: string, message?: string, buttons?: AlertButton[]) => void;
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
  alert: (title: string, message?: string, buttons?: AlertButton[]) => {
    showGlobalNotification?.(title, message, buttons);
  },
};

const isError = (title: string) =>
  /error|inválid|no se pudo|expirad/i.test(title);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useContext(ThemeContext);
  const [notification, setNotification] = useState<Notification | null>(null);

  const show = (title: string, message?: string, buttons: AlertButton[] = []) => {
    setNotification({ title, message, buttons });
  };

  showGlobalNotification = show;

  const value = useMemo(() => ({ show }), []);
  const error = notification ? isError(notification.title) : false;
  const buttons = notification?.buttons.length
    ? notification.buttons
    : [{ text: 'Entendido' }];

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
        <Pressable style={styles.backdrop} onPress={() => dismiss()}>
          <Pressable
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={[styles.icon, { backgroundColor: error ? theme.errorBackground : '#e3f0ff' }]}>
              <Ionicons
                name={error ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                size={28}
                color={error ? theme.errorText : theme.primary}
              />
            </View>

            <Text style={[styles.title, { color: theme.text }]}>{notification?.title}</Text>
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
                    style={[
                      styles.button,
                      secondary
                        ? [styles.secondaryButton, { borderColor: theme.border }]
                        : { backgroundColor: destructive ? '#c0392b' : theme.primary },
                    ]}
                    onPress={() => dismiss(button)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        { color: secondary ? theme.text : '#ffffff' },
                      ]}
                    >
                      {button.text ?? 'Entendido'}
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
    backgroundColor: 'rgba(13, 31, 76, 0.42)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#0d1b3e',
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
