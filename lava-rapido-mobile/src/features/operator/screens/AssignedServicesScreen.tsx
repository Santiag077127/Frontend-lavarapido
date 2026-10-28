import React, {
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemeContext } from '../../../theme/ThemeContext';
import AssignedServiceCard from '../components/AssignedServiceCard';
import { useTranslation } from 'react-i18next';
import { classifyApiError, type ApiErrorKind } from '../../../services/api';
import {
  assignmentService,
  Assignment,
  AssignmentStatus,
} from '../../../services/assignmentService';
import { getFilteredAssignments, type AssignmentFilter } from '../services/assignmentFilters';

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
  const [filter, setFilter] = useState<AssignmentFilter>('all');

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

  useFocusEffect(useCallback(() => {
    void loadAssignments();
    return undefined;
  }, [loadAssignments]));

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

  const visibleAssignments = getFilteredAssignments(assignments, filter);
  const filters: AssignmentFilter[] = ['all', 'assigned', 'inProgress', 'completed'];

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <SafeAreaView edges={['top']}
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
      </SafeAreaView>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <SafeAreaView
      edges={['top']}
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filters}
        accessibilityLabel={t('operator.filters.label')}
      >
        {filters.map((item) => {
          const selected = filter === item;
          return (
            <TouchableOpacity
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item)}
              style={[styles.filterButton, {
                backgroundColor: selected ? theme.primary : theme.card,
                borderColor: selected ? theme.primary : theme.border,
              }]}
            >
              <Text style={[styles.filterText, { color: selected ? theme.onPrimary : theme.text }]}>
                {t(`operator.filters.${item}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={visibleAssignments}
        keyExtractor={(item) =>
          item.idAsignacion
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          visibleAssignments.length > 0
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
        ListHeaderComponent={loadError && visibleAssignments.length > 0 ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.errorBackground, borderColor: theme.errorBorder }]}>
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: theme.errorText, flex: 1 }}>{`${t(`apiErrors.${loadError}`)} ${t('apiErrors.staleData')}`}</Text>
            <TouchableOpacity accessibilityRole="button" onPress={loadAssignments}><Text style={[styles.errorRetry, { color: theme.primary }]}>{t('common.retry')}</Text></TouchableOpacity>
          </View>
        ) : undefined}
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
              {loadError ? t('operator.errors.loadTitle') : filter !== 'all' ? t('operator.filters.empty') : t('operator.empty.title')}
            </Text>

            <Text
              style={[
                styles.empty,
                {
                  color: theme.textSecondary,
                },
              ]}
            >
              {loadError ? t(`apiErrors.${loadError}`) : filter !== 'all' ? t('operator.filters.emptyDescription') : t('operator.empty.description')}
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
    </SafeAreaView>
  );
}

// =========================================================
// ESTILOS
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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

  filterScroll: { alignSelf: 'stretch', flexGrow: 0, flexShrink: 0, flexBasis: 'auto' },
  filters: { flexDirection: 'row', flexGrow: 0, alignItems: 'flex-start', gap: 8, paddingBottom: 10 },
  filterButton: { alignSelf: 'flex-start', flexGrow: 0, flexShrink: 0, flexBasis: 'auto', minHeight: 42, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  filterText: { fontSize: 14, fontWeight: '700' },

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
    justifyContent: 'flex-start',
    paddingTop: 8,
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
