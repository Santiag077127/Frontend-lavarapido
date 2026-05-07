import { createNativeStackNavigator } from '@react-navigation/native-stack'
import LoginScreen from '../features/auth/screens/LoginScreen'
import RegisterScreen from '../features/auth/screens/RegisterScreen'

const Stack = createNativeStackNavigator()

export default function AuthNavigator({ setIsLoggedIn }: any) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => (
          <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Stack.Screen>

      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}