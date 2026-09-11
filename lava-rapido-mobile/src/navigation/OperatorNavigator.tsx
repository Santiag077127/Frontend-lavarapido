import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AssignedServicesScreen from '../features/operator/screens/AssignedServicesScreen';
import OperatorProfileScreen from '../features/operator/screens/OperatorProfileScreen';
import { ThemeContext } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

type Props = { setIsLoggedIn: (value: boolean) => void };

export default function OperatorNavigator({ setIsLoggedIn }: Props) {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
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
