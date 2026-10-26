import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LegalDocument } from '../legalContent';

type Props = {
  acceptsPrivacy: boolean;
  acceptsTerms: boolean;
  borderColor: string;
  inputBackground: string;
  primaryColor: string;
  onTogglePrivacy: () => void;
  onToggleTerms: () => void;
  onOpenDocument: (document: LegalDocument) => void;
  textColor: string;
  onPrimaryColor: string;
};

export default function RegisterLegalConsent({
  acceptsPrivacy,
  acceptsTerms,
  borderColor,
  inputBackground,
  primaryColor,
  onTogglePrivacy,
  onToggleTerms,
  onOpenDocument,
  textColor,
  onPrimaryColor,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="He leído la política de privacidad"
          accessibilityState={{ checked: acceptsPrivacy }}
          onPress={onTogglePrivacy}
          style={[styles.checkbox, { borderColor, backgroundColor: acceptsPrivacy ? primaryColor : inputBackground }]}
        >
          {acceptsPrivacy ? <Text style={[styles.mark, { color: onPrimaryColor }]}>✓</Text> : null}
        </Pressable>
        <Text style={[styles.label, { color: textColor }]}>He leído la </Text>
        <Pressable accessibilityRole="link" accessibilityLabel="Política de privacidad" onPress={() => onOpenDocument('privacy')}>
          <Text style={[styles.link, { color: primaryColor }]}>política de privacidad</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="Acepto los términos y condiciones"
          accessibilityState={{ checked: acceptsTerms }}
          onPress={onToggleTerms}
          style={[styles.checkbox, { borderColor, backgroundColor: acceptsTerms ? primaryColor : inputBackground }]}
        >
          {acceptsTerms ? <Text style={[styles.mark, { color: onPrimaryColor }]}>✓</Text> : null}
        </Pressable>
        <Text style={[styles.label, { color: textColor }]}>Acepto los </Text>
        <Pressable accessibilityRole="link" accessibilityLabel="Términos y condiciones" onPress={() => onOpenDocument('terms')}>
          <Text style={[styles.link, { color: primaryColor }]}>términos y condiciones</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  mark: { fontSize: 17, fontWeight: '700' },
  label: { fontSize: 14, lineHeight: 20 },
  link: { fontSize: 14, lineHeight: 20, textDecorationLine: 'underline' },
});
