import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemeContext } from '../../../theme/ThemeContext';
import { assignmentService, Assignment, AssignmentStatus } from '../../../services/assignmentService';

const labels: Record<AssignmentStatus, string> = {
  asignada: 'Asignada',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function AssignedServicesScreen() {
  const { theme } = useContext(ThemeContext);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      const response = await assignmentService.getMine();
      setAssignments(response.data);
    } catch {
      Alert.alert('No fue posible cargar las asignaciones', 'Verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAssignments(); }, [loadAssignments]);

  const changeStatus = async (assignment: Assignment, estado: AssignmentStatus) => {
    try {
      setUpdatingId(assignment.idAsignacion);
      const response = await assignmentService.updateStatus(assignment.idAsignacion, estado);
      setAssignments(items => items.map(item => item.idAsignacion === assignment.idAsignacion ? response.data : item));
    } catch {
      Alert.alert('No se pudo actualizar', 'El estado de la asignación no pudo cambiarse.');
    } finally {
      setUpdatingId(null);
    }
  };

  const actionFor = (assignment: Assignment) => {
    if (assignment.estado === 'asignada') return { label: 'Iniciar servicio', status: 'en_proceso' as const };
    if (assignment.estado === 'en_proceso') return { label: 'Finalizar servicio', status: 'completada' as const };
    return null;
  };

  if (loading) return <View style={[styles.center, { backgroundColor: theme.background }]}><ActivityIndicator color={theme.primary} /></View>;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Mis asignaciones</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Gestiona los servicios que tienes asignados.</Text>
      <FlatList
        data={assignments}
        keyExtractor={item => item.idAsignacion}
        contentContainerStyle={assignments.length ? styles.list : styles.emptyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAssignments(); }} tintColor={theme.primary} />}
        ListEmptyComponent={<Text style={[styles.empty, { color: theme.textSecondary }]}>No tienes servicios asignados por ahora.</Text>}
        renderItem={({ item }) => {
          const action = actionFor(item);
          return <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Servicio #{item.idReserva.slice(0, 8)}</Text>
            <Text style={[styles.status, { color: theme.primary }]}>{labels[item.estado]}</Text>
            <Text style={[styles.date, { color: theme.textSecondary }]}>Asignado: {new Date(item.fechaAsignacion).toLocaleString()}</Text>
            {action && <TouchableOpacity disabled={updatingId === item.idAsignacion} onPress={() => changeStatus(item, action.status)} style={[styles.button, { backgroundColor: theme.primary, opacity: updatingId === item.idAsignacion ? 0.65 : 1 }]}>
              <Text style={styles.buttonText}>{updatingId === item.idAsignacion ? 'Actualizando...' : action.label}</Text>
            </TouchableOpacity>}
          </View>;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700' }, subtitle: { fontSize: 15, marginTop: 6, marginBottom: 20 }, list: { paddingBottom: 24 }, emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { textAlign: 'center', fontSize: 16 }, card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 }, cardTitle: { fontSize: 17, fontWeight: '700' }, status: { marginTop: 8, fontWeight: '700', textTransform: 'uppercase', fontSize: 12 }, date: { marginTop: 8, fontSize: 13 },
  button: { marginTop: 16, borderRadius: 9, alignItems: 'center', paddingVertical: 11 }, buttonText: { color: '#fff', fontWeight: '700' },
});
