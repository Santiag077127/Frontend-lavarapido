import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemeContext } from '../../../theme/ThemeContext';
import {
  assignmentService,
  Assignment,
  AssignmentStatus,
} from '../../../services/assignmentService';

// =========================================================
// ETIQUETAS DE ESTADO
// =========================================================

const labels: Record<AssignmentStatus, string> = {
  asignada: 'Asignada',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

// =========================================================
// PANTALLA
// =========================================================

export default function AssignedServicesScreen() {
  const { theme } = useContext(ThemeContext);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // =======================================================
  // CARGAR ASIGNACIONES
  // =======================================================

  const loadAssignments = useCallback(async () => {
    try {
      const response = await assignmentService.getMine();

      setAssignments(response.data);
    } catch (error) {
      console.error(
        'Error cargando asignaciones:',
        error
      );

      Alert.alert(
        'No fue posible cargar las asignaciones',
        'Verifica tu conexión e inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =======================================================
  // CARGAR AL ABRIR LA PANTALLA
  // =======================================================

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // =======================================================
  // ACTUALIZAR ESTADO
  // =======================================================

  const changeStatus = async (
    assignment: Assignment,
    estado: AssignmentStatus
  ) => {
    try {
      setUpdatingId(assignment.idAsignacion);

      const response =
        await assignmentService.updateStatus(
          assignment.idAsignacion,
          estado
        );

      setAssignments((items) =>
        items.map((item) =>
          item.idAsignacion === assignment.idAsignacion
            ? response.data
            : item
        )
      );
    } catch (error) {
      console.error(
        'Error actualizando asignación:',
        error
      );

      Alert.alert(
        'No se pudo actualizar',
        'El estado de la asignación no pudo cambiarse.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =======================================================
  // ACCIÓN SEGÚN EL ESTADO
  // =======================================================

  const actionFor = (assignment: Assignment) => {
    if (assignment.estado === 'asignada') {
      return {
        label: 'Iniciar servicio',
        status: 'en_proceso' as const,
      };
    }

    if (assignment.estado === 'en_proceso') {
      return {
        label: 'Finalizar servicio',
        status: 'completada' as const,
      };
    }

    return null;
  };

  // =======================================================
  // FORMATEAR FECHA
  // =======================================================

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString(
        'es-CO',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      );
    } catch {
      return date;
    }
  };

  // =======================================================
  // FORMATEAR HORA
  // =======================================================

  const formatTime = (time: string) => {
    if (!time) {
      return '--:--';
    }

    const parts = time.split(':');

    if (parts.length < 2) {
      return time;
    }

    return `${parts[0]}:${parts[1]}`;
  };

  // =======================================================
  // FORMATEAR PRECIO
  // =======================================================

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: theme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          Cargando tus servicios...
        </Text>
      </View>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      {/* ===================================================
          ENCABEZADO
      =================================================== */}

      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
        >
          Mis servicios
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          Servicios asignados para atender.
        </Text>
      </View>

      {/* ===================================================
          LISTA
      =================================================== */}

      <FlatList
        data={assignments}
        keyExtractor={(item) =>
          item.idAsignacion
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          assignments.length > 0
            ? styles.list
            : styles.emptyList
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadAssignments();
            }}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyTitle,
                {
                  color: theme.text,
                },
              ]}
            >
              No tienes servicios asignados
            </Text>

            <Text
              style={[
                styles.empty,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              Cuando un administrador te asigne
              un servicio, aparecerá aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const action = actionFor(item);

          const isUpdating =
            updatingId === item.idAsignacion;

          return (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* =========================================
                  SERVICIO Y ESTADO
              ========================================= */}

              <View style={styles.cardHeader}>
                <View style={styles.serviceHeader}>
                  <Text
                    style={[
                      styles.serviceName,
                      {
                        color: theme.text,
                      },
                    ]}
                  >
                    {item.nombreServicio}
                  </Text>

                  <Text
                    style={[
                      styles.reservationId,
                      {
                        color: theme.textSecondary,
                      },
                    ]}
                  >
                    Reserva #{item.idReserva.slice(0, 8)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: theme.primary,
                      },
                    ]}
                  >
                    {labels[item.estado]}
                  </Text>
                </View>
              </View>

              {/* =========================================
                  DESCRIPCIÓN
              ========================================= */}

              {!!item.descripcionServicio && (
                <Text
                  style={[
                    styles.description,
                    {
                      color: theme.textSecondary,
                    },
                  ]}
                >
                  {item.descripcionServicio}
                </Text>
              )}

              {/* =========================================
                  INFORMACIÓN DEL CLIENTE
              ========================================= */}

              <View
                style={[
                  styles.section,
                  {
                    borderTopColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Cliente
                </Text>

                <Text
                  style={[
                    styles.infoText,
                    {
                      color: theme.textSecondary,
                    },
                  ]}
                >
                  {item.nombreCliente}
                </Text>
              </View>

              {/* =========================================
                  INFORMACIÓN DEL VEHÍCULO
              ========================================= */}

              <View
                style={[
                  styles.section,
                  {
                    borderTopColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Vehículo
                </Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoColumn}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Placa
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {item.placa}
                    </Text>
                  </View>

                  <View style={styles.infoColumn}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Color
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {item.color || 'No especificado'}
                    </Text>
                  </View>

                  <View style={styles.infoColumn}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Tipo
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {item.tipoVehiculo}
                    </Text>
                  </View>
                </View>
              </View>

              {/* =========================================
                  INFORMACIÓN DEL SERVICIO
              ========================================= */}

              <View
                style={[
                  styles.section,
                  {
                    borderTopColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Detalles del servicio
                </Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoColumn}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Duración
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {item.duracionMinutos} min
                    </Text>
                  </View>

                  <View style={styles.infoColumn}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Precio
                    </Text>

                    <Text
                      style={[
                        styles.price,
                        {
                          color: theme.primary,
                        },
                      ]}
                    >
                      {formatPrice(
                        item.precioServicio
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* =========================================
                  FECHA Y HORA
              ========================================= */}

              <View
                style={[
                  styles.section,
                  {
                    borderTopColor: theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    {
                      color: theme.text,
                    },
                  ]}
                >
                  Reserva
                </Text>

                <View style={styles.infoRow}>
                  <View style={styles.infoColumn}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Fecha
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {formatDate(
                        item.fechaReserva
                      )}
                    </Text>
                  </View>

                  <View style={styles.infoColumn}>
                    <Text
                      style={[
                        styles.infoLabel,
                        {
                          color: theme.textSecondary,
                        },
                      ]}
                    >
                      Hora
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {formatTime(
                        item.horaReserva
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              {/* =========================================
                  BOTÓN DE ACCIÓN
              ========================================= */}

              {action && (
                <TouchableOpacity
                  disabled={isUpdating}
                  activeOpacity={0.8}
                  onPress={() =>
                    changeStatus(
                      item,
                      action.status
                    )
                  }
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        theme.primary,
                      opacity: isUpdating
                        ? 0.65
                        : 1,
                    },
                  ]}
                >
                  {isUpdating ? (
                    <ActivityIndicator
                      color="#fff"
                    />
                  ) : (
                    <Text
                      style={styles.buttonText}
                    >
                      {action.label}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* =========================================
                  SERVICIO COMPLETADO
              ========================================= */}

              {item.estado === 'completada' && (
                <View
                  style={[
                    styles.completedContainer,
                    {
                      borderColor:
                        theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.completedText,
                      {
                        color: theme.primary,
                      },
                    ]}
                  >
                    Servicio completado
                  </Text>
                </View>
              )}

              {/* =========================================
                  SERVICIO CANCELADO
              ========================================= */}

              {item.estado === 'cancelada' && (
                <View
                  style={[
                    styles.completedContainer,
                    {
                      borderColor:
                        theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.completedText,
                      {
                        color: theme.textSecondary,
                      },
                    ]}
                  >
                    Servicio cancelado
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

// =========================================================
// ESTILOS
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 15,
    marginTop: 6,
  },

  list: {
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  empty: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  serviceHeader: {
    flex: 1,
  },

  serviceName: {
    fontSize: 19,
    fontWeight: '700',
  },

  reservationId: {
    fontSize: 12,
    marginTop: 4,
  },

  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 14,
  },

  section: {
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 14,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },

  infoText: {
    fontSize: 15,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },

  infoColumn: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  price: {
    fontSize: 15,
    fontWeight: '700',
  },

  button: {
    marginTop: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  completedContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },

  completedText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

