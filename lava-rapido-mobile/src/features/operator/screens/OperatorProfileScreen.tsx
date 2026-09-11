import React, { useContext } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../../theme/ThemeContext';
import { setToken } from '../../../services/api';

type Props = { setIsLoggedIn: (value: boolean) => void };

export default function OperatorProfileScreen({ setIsLoggedIn }: Props) {
  const { theme } = useContext(ThemeContext);
  const logout = () => Alert.alert('Cerrar sesión', '¿Deseas salir de tu cuenta de operador?', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Salir', style: 'destructive', onPress: () => { setToken(null); setIsLoggedIn(false); } },
  ]);

  return <View style={[styles.container, { backgroundColor: theme.background }]}>
    <View style={[styles.avatar, { backgroundColor: theme.primary }]}><Ionicons name="person" size={38} color="#fff" /></View>
    <Text style={[styles.title, { color: theme.text }]}>Cuenta de operador</Text>
    <Text style={[styles.description, { color: theme.textSecondary }]}>Desde aquí puedes consultar y actualizar los servicios que te han sido asignados.</Text>
    <TouchableOpacity style={[styles.button, { borderColor: theme.errorText }]} onPress={logout}><Text style={[styles.buttonText, { color: theme.errorText }]}>Cerrar sesión</Text></TouchableOpacity>
  </View>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, paddingTop: 72 }, avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 27, fontWeight: '700', marginTop: 20 }, description: { fontSize: 16, lineHeight: 24, marginTop: 10 }, button: { borderWidth: 1, borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 36 }, buttonText: { fontWeight: '700', fontSize: 16 } });
