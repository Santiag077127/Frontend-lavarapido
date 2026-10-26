import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
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
import AssignedServiceCard from '../components/AssignedServiceCard';
import { useTranslation } from 'react-i18next';
import { classifyApiError, type ApiErrorKind } from '../../../services/api';
import {
  assignmentService,
  Assignment,
  AssignmentStatus,
} from '../../../services/assignmentService';

// =========================================================
// PANTALLA
// =========================================================

export default function AssignedServicesScreen() {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const updatingRef = useRef(false);
  const [loadError, setLoadError] = useState<ApiErrorKind | null>(null);

  // =======================================================
  // CARGAR ASIGNACIONES
  // =======================================================

  const loadAssignments = useCallback(async () => {
    try {
      setLoadError(null);
      const response = await assignmentService.getMine();
      if (!Array.isArray(response.data)) throw new Error('invalid-assignments-response');
      setAssignments(response.data);
    } catch (error) {
      const kind = classifyApiError(error);
      if (kind !== 'unauthorized') setLoadError(kind);
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
    if (updatingRef.current) return;
    updatingRef.current = true;
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
    } catch {
      Alert.alert(
        t('operator.errors.updateTitle'),
        t('operator.errors.updateMessage')
      );
    } finally {
      updatingRef.current = false;
      setUpdatingId(null);
    }
  };

  const actionFor = (assignment: Assignment) => {
    if (assignment.estado === 'asignada') {
      return { label: t('operator.actions.start'), status: 'en_proceso' as const };
    }
    if (assignment.estado === 'en_proceso') {
      return { label: t('operator.actions.finish'), status: 'completada' as const };
    }
    return null;
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
        ListHeaderComponent={loadError && assignments.length > 0 ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder }]}>
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: theme.errorText, flex: 1 }}>{`${t(`apiErrors.${loadError}`)} ${t('apiErrors.staleData')}`}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={loadAssignments}><Text style={[styles.errorRetry, { color: theme.primary }]}>{t('common.retry')}</Text></TouchableOpacity>
          </View>
        ) : null}
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
              {loadError ? t('operator.errors.loadTitle') : t('operator.empty.title')}
            </Text>

            <Text
              style={[
                styles.empty,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              {loadError ? t(`apiErrors.${loadError}`) : t('operator.empty.description')}
            </Text>
            {loadError && <TouchableOpacity accessibilityRole="button" onPress={loadAssignments} style={styles.retryButton}><Text style={{ color: theme.primary, fontWeight: '700' }}>{t('common.retry')}</Text></TouchableOpacity>}
          </View>
        }
        renderItem={({ item }) => (
          <AssignedServiceCard
            item={item}
            action={actionFor(item)}
            isUpdating={updatingId === item.idAsignacion}
            onChangeStatus={changeStatus}
          />
        )}
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
  errorBanner: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  errorRetry: { fontSize: 14, fontWeight: '700' },
  retryButton: { marginTop: 14, minHeight: 44, justifyContent: 'center', paddingHorizontal: 18 },

});
