import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type MessageProps = {
  message: string;
  variant: 'error' | 'success';
  theme: any;
};

export function RegisterFormMessage({ message, variant, theme }: MessageProps) {
  if (!message) return null;
  const isError = variant === 'error';
  return (
    <View style={[styles.messageBox, {
      backgroundColor: isError ? theme.errorBackground : theme.successBackground,
      borderColor: isError ? theme.errorBorder : theme.successBorder,
    }]}>
      <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.messageText, { color: isError ? theme.errorText : theme.successText }]}
      >
        {isError ? '⚠ ' : '✓ '}{message}
      </Text>
    </View>
  );
}

type ActionsProps = {
  loading: boolean;
  theme: any;
  translate: (key: string) => string;
  onSubmit: () => void;
  onLogin: () => void;
};

export function RegisterFormActions({ loading, theme, translate: t, onSubmit, onLogin }: ActionsProps) {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.button, { backgroundColor: theme.primaryDark }, loading && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={loading}
        accessibilityLabel={loading ? `${t('register.button')}, ${t('accessibility.inProgress')}` : t('register.button')}
        accessibilityRole="button"
        accessibilityState={{ disabled: loading, busy: loading }}
        accessibilityLiveRegion="polite"
      >
        {loading ? <ActivityIndicator color={theme.onPrimary} /> : <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('register.button')}</Text>}
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.7} onPress={onLogin} disabled={loading} accessibilityRole="button">
        <Text style={[styles.link, { color: theme.text }]}>
          {t('register.hasAccount')}{' '}
          <Text style={[styles.linkHighlight, { color: theme.primary }]}>{t('register.signIn')}</Text>
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  messageBox: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1 },
  messageText: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  button: { width: '100%', minHeight: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 5, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { fontSize: 18, fontWeight: '600' },
  link: { textAlign: 'center', marginTop: 5, fontSize: 14, paddingVertical: 8 },
  linkHighlight: { fontWeight: '700', textDecorationLine: 'underline' },
});
