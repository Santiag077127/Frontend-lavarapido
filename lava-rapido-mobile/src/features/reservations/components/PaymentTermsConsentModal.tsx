import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type Props = {
  visible: boolean;
  surfaceColor: string;
  textColor: string;
  secondaryTextColor: string;
  borderColor: string;
  buttonColor: string;
  onPrimaryColor: string;
  onCancel: () => void;
  onContinue: () => void;
  onReadTerms: () => void;
};

export default function PaymentTermsConsentModal({
  visible,
  surfaceColor,
  textColor,
  secondaryTextColor,
  borderColor,
  buttonColor,
  onPrimaryColor,
  onCancel,
  onContinue,
  onReadTerms,
}: Props) {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  React.useEffect(() => {
    if (visible) setAccepted(false);
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: surfaceColor }]}>
          <Text accessibilityRole="header" style={[styles.title, { color: textColor }]}>
            {t('mobile.paymentFlow.termsReminderTitle')}
          </Text>
          <ScrollView style={styles.copy} contentContainerStyle={styles.copyContent}>
            <Text style={[styles.intro, { color: textColor }]}>
              {t('mobile.paymentFlow.termsReminderIntro')}
            </Text>
            <Text style={[styles.warning, { color: secondaryTextColor }]}>
              {t('mobile.paymentFlow.termsReminderWarning')}
            </Text>
            <Pressable accessibilityRole="link" onPress={onReadTerms} style={styles.readLink}>
              <Text style={[styles.linkText, { color: buttonColor }]}>
                {t('mobile.paymentFlow.termsRead')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
              onPress={() => setAccepted(value => !value)}
              style={styles.acceptRow}
            >
              <View testID="payment-terms-checkbox-indicator" style={[styles.checkbox, { borderColor, backgroundColor: accepted ? buttonColor : 'transparent' }]}>
                {accepted ? <Text style={[styles.checkmark, { color: onPrimaryColor }]}>✓</Text> : null}
              </View>
              <Text style={[styles.acceptText, { color: textColor }]}>
                {t('mobile.paymentFlow.termsConsent')}
              </Text>
            </Pressable>
          </ScrollView>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={[styles.button, styles.cancelButton, { borderColor }]}>
              <Text style={[styles.cancelText, { color: textColor }]}>{t('mobile.paymentFlow.termsCancel')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !accepted }}
              disabled={!accepted}
              onPress={onContinue}
              style={[styles.button, styles.continueButton, { backgroundColor: buttonColor, opacity: accepted ? 1 : 0.5 }]}
            >
              <Text style={[styles.continueText, { color: onPrimaryColor }]}>{t('mobile.paymentFlow.termsContinue')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.55)' },
  modal: { width: '100%', maxWidth: 520, maxHeight: '90%', alignSelf: 'center', borderRadius: 18, padding: 20 },
  title: { fontSize: 19, lineHeight: 25, fontWeight: '800', marginBottom: 12 },
  copy: { flexGrow: 0, flexShrink: 1, minHeight: 0 },
  copyContent: { paddingBottom: 4 },
  intro: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  warning: { fontSize: 14, lineHeight: 21, marginTop: 10 },
  readLink: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginTop: 4 },
  linkText: { fontSize: 14, lineHeight: 20, fontWeight: '700', textDecorationLine: 'underline' },
  acceptRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 16, lineHeight: 18, fontWeight: '800' },
  acceptText: { flex: 1, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  button: { minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingHorizontal: 12 },
  cancelButton: { borderWidth: 1 },
  continueButton: { borderWidth: 1, borderColor: 'transparent' },
  cancelText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  continueText: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
