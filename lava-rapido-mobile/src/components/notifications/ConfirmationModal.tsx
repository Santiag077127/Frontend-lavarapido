import React, { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../theme/ThemeContext';

export type ConfirmationVariant = 'danger' | 'warning' | 'normal';
type Props = { visible: boolean; title: string; message: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void; variant?: ConfirmationVariant };

export default function ConfirmationModal({ visible, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, variant = 'normal' }: Props) {
  const { theme, darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  const accents = {
    danger: { background: theme.errorBackground, border: theme.errorBorder, foreground: theme.errorText, confirmBackground: theme.errorAction, icon: 'alert-circle-outline' as const },
    warning: { background: theme.warningBackground, border: theme.warningBorder, foreground: theme.warningText, confirmBackground: darkMode ? theme.primaryDark : theme.primary, icon: 'warning-outline' as const },
    normal: { background: theme.infoBackground, border: theme.infoBorder, foreground: theme.primary, confirmBackground: darkMode ? theme.primaryDark : theme.primary, icon: 'help-circle-outline' as const },
  }[variant];

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <Pressable accessible={false} style={[styles.backdrop, { backgroundColor: theme.overlay }]} onPress={onCancel}>
        <Pressable style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]} onPress={(event) => event.stopPropagation()} accessible={false} accessibilityViewIsModal>
          <View style={[styles.icon, { backgroundColor: accents.background, borderColor: accents.border }]}>
            <Ionicons name={accents.icon} size={30} color={accents.foreground} />
          </View>
          <Text accessibilityRole="alert" style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={confirmLabel} accessibilityHint={t('accessibility.confirmAction')} style={({ pressed }) => [styles.button, { backgroundColor: accents.confirmBackground, opacity: pressed ? 0.82 : 1 }]} onPress={onConfirm}>
            <Text style={[styles.confirmText, { color: variant === 'danger' ? theme.errorOnAction : theme.onPrimary }]}>{confirmLabel}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={cancelLabel} style={({ pressed }) => [styles.button, styles.cancelButton, { borderColor: theme.border, opacity: pressed ? 0.72 : 1 }]} onPress={onCancel}>
            <Text style={[styles.cancelText, { color: theme.text }]}>{cancelLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 380, alignSelf: 'center', alignItems: 'center', borderWidth: 1, borderRadius: 22, padding: 24, elevation: 14, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.24, shadowRadius: 18 },
  icon: { width: 58, height: 58, borderRadius: 29, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { width: '100%', fontSize: 19, lineHeight: 25, fontWeight: '800', textAlign: 'center' },
  message: { width: '100%', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 22 },
  button: { width: '100%', minHeight: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  confirmText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  cancelButton: { backgroundColor: 'transparent', borderWidth: 1, marginTop: 10 },
  cancelText: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
