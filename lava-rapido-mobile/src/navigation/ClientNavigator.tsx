import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabNavigator from './TabNavigator'
import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen'

const Stack = createNativeStackNavigator()

export default function ClientNavigator() {
  return (
    <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{
        presentation: 'card',
        animation: 'slide_from_bottom',
    }}
    />
  )
}