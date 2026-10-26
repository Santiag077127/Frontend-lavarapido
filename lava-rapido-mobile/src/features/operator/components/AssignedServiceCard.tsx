import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../theme/ThemeContext';
import type { Assignment, AssignmentStatus } from '../../../services/assignmentService';

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

type Props = {
  item: Assignment;
  action: { label: string; status: AssignmentStatus } | null;
  isUpdating: boolean;
  onChangeStatus: (assignment: Assignment, status: AssignmentStatus) => void;
};

export default function AssignedServiceCard({ item, action, isUpdating, onChangeStatus }: Props) {
  const { theme } = useContext(ThemeContext);
  const { t, i18n } = useTranslation();

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const statusStyle = {
    asignada: { backgroundColor: theme.infoBackground, color: theme.infoText },
    en_proceso: { backgroundColor: theme.processBackground, color: theme.inProgressText },
    completada: { backgroundColor: theme.successBackground, color: theme.successText },
    cancelada: { backgroundColor: theme.errorBackground, color: theme.errorText },
  }[item.estado];

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
                      borderColor: statusStyle.color,
                      backgroundColor: statusStyle.backgroundColor,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: statusStyle.color,
                      },
                    ]}
                  >
                    {t(labelKeys[item.estado])}
                  </Text>
                </View>
              </View>

              

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

              

              {action && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={isUpdating ? `${action.label}, ${t('accessibility.inProgress')}` : action.label}
                  accessibilityState={{ disabled: isUpdating, busy: isUpdating }}
                  disabled={isUpdating}
                  activeOpacity={0.8}
                  onPress={() =>
                    onChangeStatus(item, action.status)
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
                      color={theme.onPrimary}
                    />
                  ) : (
                    <Text
                      style={[styles.buttonText, { color: theme.onPrimary }]}
                    >
                      {action.label}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              

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
}

const styles = StyleSheet.create({
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
  }
});
