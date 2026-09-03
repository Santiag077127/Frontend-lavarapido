import { createStackNavigator } from '@react-navigation/stack'

import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen'

const Stack = createStackNavigator()

export default function ServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ServiceDetail" 
        component={ServiceDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  )
}