import React, { ReactNode, useContext } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { ThemeContext } from '../../theme/ThemeContext';
import BackButton from './BackButton';

type ScreenHeaderProps = {
  title: string;
  onBack: () => void;
  subtitle?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenHeader({
  title,
  onBack,
  subtitle,
  accessibilityLabel,
  disabled = false,
  right,
  style,
}: ScreenHeaderProps) {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      <BackButton accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onBack} />
      <View style={styles.copy}>
        <Text accessibilityRole="header" numberOfLines={2} style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>
        {subtitle ? <Text numberOfLines={2} style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 76, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 16 },
  copy: { flex: 1, minWidth: 0, marginLeft: 13 },
  title: { fontSize: 21, fontWeight: '800' },
  subtitle: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  right: { marginLeft: 12 },
});
