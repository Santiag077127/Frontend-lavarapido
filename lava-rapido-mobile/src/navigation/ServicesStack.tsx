import { createStackNavigator } from '@react-navigation/stack'
import ServicesScreen from '../features/services/screens/ServicesScreen'
import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen'

const Stack = createStackNavigator()

export default function ServicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ServicesList" 
        component={ServicesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ServiceDetail" 
        component={ServiceDetailScreen}
        options={{ title: 'Detalle' }}
      />
    </Stack.Navigator>
  )
}