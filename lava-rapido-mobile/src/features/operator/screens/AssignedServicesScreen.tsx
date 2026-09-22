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
import { useTranslation } from 'react-i18next';
import {
  assignmentService,
  Assignment,
  AssignmentStatus,
} from '../../../services/assignmentService';

// =========================================================
// ETIQUETAS DE ESTADO
// =========================================================

const labelKeys: Record<AssignmentStatus, string> = {
  asignada: 'operator.status.assigned',
  en_proceso: 'operator.status.inProgress',
  completada: 'operator.status.completed',
  cancelada: 'operator.status.cancelled',
};

const vehicleTypeKeys: Record<string, string> = {
  CARRO: 'vehicles.types.car',
  CAMIONETA: 'vehicles.types.pickup',
  MOTO: 'vehicles.types.motorcycle',
  MOTOCARRO: 'vehicles.types.motortricycle',
  FURGONETA: 'vehicles.types.van',
  PESADO: 'vehicles.types.heavy',
};

// =========================================================
// PANTALLA
// =========================================================

export default function AssignedServicesScreen() {
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

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
        t('operator.errors.loadTitle'),
        t('operator.errors.loadMessage')
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
        t('operator.errors.updateTitle'),
        t('operator.errors.updateMessage')
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
        label: t('operator.actions.start'),
        status: 'en_proceso' as const,
      };
    }

    if (assignment.estado === 'en_proceso') {
      return {
        label: t('operator.actions.finish'),
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
        i18n.language,
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
    return new Intl.NumberFormat(i18n.language, {
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
          {t('operator.loading')}
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
          {t('operator.title')}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: theme.textSecondary,
            },
          ]}
        >
          {t('operator.subtitle')}
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
              {t('operator.empty.title')}
            </Text>

            <Text
              style={[
                styles.empty,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              {t('operator.empty.description')}
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
                    {t('operator.reservation', { id: item.idReserva.slice(0, 8) })}
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
                    {t(labelKeys[item.estado])}
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
                  {t('operator.fields.client')}
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
                  {t('operator.fields.vehicle')}
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
                      {t('vehicles.fields.plate')}
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
                      {t('vehicles.fields.color')}
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {item.color || t('vehicles.fields.unspecified')}
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
                      {t('vehicles.fields.type')}
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {vehicleTypeKeys[item.tipoVehiculo]
                        ? t(vehicleTypeKeys[item.tipoVehiculo])
                        : item.tipoVehiculo}
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
                  {t('operator.fields.serviceDetails')}
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
                      {t('operator.fields.duration')}
                    </Text>

                    <Text
                      style={[
                        styles.infoValue,
                        {
                          color: theme.text,
                        },
                      ]}
                    >
                      {t('operator.duration', { count: item.duracionMinutos })}
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
                      {t('operator.fields.price')}
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
                  {t('operator.fields.reservation')}
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
                      {t('operator.fields.date')}
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
                      {t('operator.fields.time')}
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
                    {t('operator.completed')}
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
                    {t('operator.cancelled')}
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

