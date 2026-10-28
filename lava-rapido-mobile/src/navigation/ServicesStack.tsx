import { createStackNavigator } from '@react-navigation/stack'

import ServiceDetailScreen from '../features/services/screens/ServiceDetailScreen'
import { useTranslation } from 'react-i18next'

const Stack = createStackNavigator()

export default function ServicesStack() {
  const { t } = useTranslation()
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="ServiceDetail" 
        component={ServiceDetailScreen}
        options={{ title: t('mobile.reservationDetail.title') }}
      />
    </Stack.Navigator>
  )
}