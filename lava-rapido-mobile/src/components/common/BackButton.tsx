import React, { useContext } from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { ThemeContext } from '../../theme/ThemeContext';

type BackButtonProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
  hitSlop?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export default function BackButton({
  onPress,
  style,
  iconSize = 21,
  color,
  backgroundColor,
  hitSlop = 4,
  disabled = false,
  accessibilityLabel,
}: BackButtonProps) {
  const { theme, darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? t('mobile.serviceDetail.back')}
      activeOpacity={0.65}
      disabled={disabled}
      hitSlop={hitSlop}
      onPress={onPress}
      style={[
        styles.backButton,
        {
          backgroundColor: backgroundColor ?? theme.interactiveSurface,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <Ionicons name="arrow-back" size={iconSize} color={color ?? theme.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
