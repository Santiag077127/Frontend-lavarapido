import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AssignedServicesScreen from '../features/operator/screens/AssignedServicesScreen';
import OperatorProfileScreen from '../features/operator/screens/OperatorProfileScreen';
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen';
import { ThemeContext } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import NotificationTabIcon from '../components/notifications/NotificationTabIcon';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

type Props = { setIsLoggedIn: (value: boolean) => void };

export default function OperatorNavigator({ setIsLoggedIn }: Props) {
  const { theme } = useContext(ThemeContext);
  const { i18n } = useTranslation();
  const insets = useContext(SafeAreaInsetsContext) ?? { top: 0, right: 0, bottom: 0, left: 0 };
  const bottomInset = Math.max(0, insets.bottom);
  const language = i18n.resolvedLanguage || i18n.language || 'es';
  const labels: Record<string, Record<string, string>> = {
    es: { Asignaciones: 'Asignaciones', Notificaciones: 'Notificaciones', Perfil: 'Perfil' },
    en: { Asignaciones: 'Assignments', Notificaciones: 'Alerts', Perfil: 'Profile' },
    pt: { Asignaciones: 'Atribui\u00e7\u00f5es', Notificaciones: 'Avisos', Perfil: 'Perfil' },
    fr: { Asignaciones: 'Affectations', Notificaciones: 'Alertes', Perfil: 'Profil' },
  };

  return (
    <Tab.Navigator
      // Keep inactive tabs out of the native Android screen compositor while
      // preserving their navigation state.
      detachInactiveScreens={false}
      sceneContainerStyle={{
        backgroundColor: theme.background,
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabel: labels[language]?.[route.name] || route.name,
        tabBarStyle: {
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.divider,
          height: 60 + bottomInset,
          paddingBottom: bottomInset > 0 ? bottomInset : 5,
          paddingTop: 5,
        },
        tabBarIcon: ({ color, size }) => route.name === 'Notificaciones'
          ? <NotificationTabIcon color={color} size={size} />
          : <Ionicons
            name={route.name === 'Asignaciones' ? 'list-outline' : 'person-outline'}
            size={size}
            color={color}
          />,
      })}
    >
      <Tab.Screen name="Asignaciones" component={AssignedServicesScreen} />
      <Tab.Screen name="Notificaciones">
        {() => <NotificationsScreen operator />}
      </Tab.Screen>
      <Tab.Screen name="Perfil">
        {() => <OperatorProfileScreen setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
