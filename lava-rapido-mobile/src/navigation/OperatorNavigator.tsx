import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AssignedServicesScreen from '../features/operator/screens/AssignedServicesScreen';
import OperatorProfileScreen from '../features/operator/screens/OperatorProfileScreen';
import { ThemeContext } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

const Tab = createBottomTabNavigator();

type Props = { setIsLoggedIn: (value: boolean) => void };

export default function OperatorNavigator({ setIsLoggedIn }: Props) {
  const { theme } = useContext(ThemeContext);
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language || 'es';
  const labels: Record<string, Record<string, string>> = {
    es: { Asignaciones: 'Asignaciones', Perfil: 'Perfil' },
    en: { Asignaciones: 'Assignments', Perfil: 'Profile' },
    pt: { Asignaciones: 'Atribui\u00e7\u00f5es', Perfil: 'Perfil' },
    fr: { Asignaciones: 'Affectations', Perfil: 'Profil' },
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabel: labels[language]?.[route.name] || route.name,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border, height: 60, paddingBottom: 5 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={route.name === 'Asignaciones' ? 'list-outline' : 'person-outline'}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Asignaciones" component={AssignedServicesScreen} />
      <Tab.Screen name="Perfil">
        {() => <OperatorProfileScreen setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
