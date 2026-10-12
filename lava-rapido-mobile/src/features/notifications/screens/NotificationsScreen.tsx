import React, { useCallback, useContext, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../../../theme/ThemeContext';
import { notificationService, type NotificationPage } from '../../../services/notificationService';
import { reservationService } from '../../reservations/services/reservationService';
import { useTranslation } from 'react-i18next';

const translations = {
  es: { title: 'Notificaciones', unread: 'sin leer', all: 'Ver todas', only: 'Solo no leídas', readAll: 'Leer todas', loading: 'Cargando notificaciones', error: 'No se pudieron cargar las notificaciones.', retry: 'Reintentar', empty: 'Aún no hay notificaciones.', read: 'Marcar leída', assignments: 'Ver asignaciones', payment: 'Ver pago', booking: 'Ver reserva', previous: 'Anterior', next: 'Siguiente' },
  en: { title: 'Notifications', unread: 'unread', all: 'Show all', only: 'Unread only', readAll: 'Mark all read', loading: 'Loading notifications', error: 'Could not load notifications.', retry: 'Retry', empty: 'No notifications yet.', read: 'Mark read', assignments: 'View assignments', payment: 'View payment', booking: 'View booking', previous: 'Previous', next: 'Next' },
  pt: { title: 'Notificações', unread: 'não lidas', all: 'Ver todas', only: 'Só não lidas', readAll: 'Marcar todas como lidas', loading: 'Carregando notificações', error: 'Não foi possível carregar as notificações.', retry: 'Tentar novamente', empty: 'Ainda não há notificações.', read: 'Marcar como lida', assignments: 'Ver atribuições', payment: 'Ver pagamento', booking: 'Ver reserva', previous: 'Anterior', next: 'Próxima' },
  fr: { title: 'Notifications', unread: 'non lues', all: 'Tout afficher', only: 'Non lues', readAll: 'Tout marquer comme lu', loading: 'Chargement des notifications', error: 'Impossible de charger les notifications.', retry: 'Réessayer', empty: 'Aucune notification.', read: 'Marquer comme lue', assignments: 'Voir les affectations', payment: 'Voir le paiement', booking: 'Voir la réservation', previous: 'Précédente', next: 'Suivante' },
};

export default function NotificationsScreen({ operator = false }: { operator?: boolean }) {
  const { theme } = useContext(ThemeContext);
  const { i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || 'es').slice(0, 2) as keyof typeof translations;
  const copy = translations[language] || translations.es;
  const navigation = useNavigation<any>();
  const [pagina, setPagina] = useState(0);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);
  const [data, setData] = useState<NotificationPage | null>(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const requestId = useRef(0);
  const load = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true); setError(false);
    try {
      const [list, unread] = await Promise.all([notificationService.list(pagina, soloNoLeidas), notificationService.count()]);
      if (currentRequest === requestId.current) { setData(list); setCount(unread); }
    } catch { if (currentRequest === requestId.current) setError(true); }
    finally { if (currentRequest === requestId.current) setLoading(false); }
  }, [pagina, soloNoLeidas]);
  useFocusEffect(useCallback(() => {
    void load();
    return () => { requestId.current++; setData(null); setCount(0); };
  }, [load]));

  const openRelated = async (item: NonNullable<NotificationPage['content']>[number]) => {
    if (!item.reservaId || opening) return;
    setOpening(item.id);
    try {
      if (operator) navigation.navigate('Asignaciones');
      else {
        const reservation = await reservationService.getById(item.reservaId);
        navigation.getParent()?.navigate(item.tipo === 'payment' ? 'ReservationPayment' : 'ServiceDetails', { reservation });
      }
    } catch { setError(true); }
    finally { setOpening(null); }
  };

  return <View style={[styles.screen, { backgroundColor: theme.background }]}>
    <Text style={[styles.title, { color: theme.text }]}>{copy.title}</Text>
    <Text style={{ color: theme.text }}>{count} {copy.unread}</Text>
    <View style={styles.row}>
      <Pressable onPress={() => { setPagina(0); setSoloNoLeidas(!soloNoLeidas); }} accessibilityRole="button">
        <Text style={{ color: theme.primary }}>{soloNoLeidas ? copy.all : copy.only}</Text>
      </Pressable>
      <Pressable onPress={() => void notificationService.readAll().then(load).catch(() => setError(true))} disabled={count === 0} accessibilityRole="button">
        <Text style={{ color: theme.primary }}>{copy.readAll}</Text>
      </Pressable>
    </View>
    {loading ? <ActivityIndicator accessibilityLabel={copy.loading} /> : error ?
      <View><Text style={{ color: theme.text }}>{copy.error}</Text>
        <Pressable onPress={() => void load()} accessibilityRole="button"><Text style={{ color: theme.primary }}>{copy.retry}</Text></Pressable></View> :
      <FlatList data={data?.content ?? []} keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={{ color: theme.text }}>{copy.empty}</Text>}
        renderItem={({ item }) => <View style={[styles.item, { borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.text }]}>{item.leidaAt ? '' : '● '}{item.titulo}</Text>
          <Text style={{ color: theme.text }}>{item.mensaje}</Text>
          <Text style={{ color: theme.textSecondary }}>{new Date(item.createdAt).toLocaleString()}</Text>
          <View style={styles.row}>
            {!item.leidaAt && <Pressable onPress={() => void notificationService.read(item.id).then(load).catch(() => setError(true))} accessibilityRole="button"><Text style={{ color: theme.primary }}>{copy.read}</Text></Pressable>}
            {item.reservaId && <Pressable onPress={() => void openRelated(item)} disabled={opening === item.id} accessibilityRole="button"><Text style={{ color: theme.primary }}>{operator ? copy.assignments : item.tipo === 'payment' ? copy.payment : copy.booking}</Text></Pressable>}
          </View>
        </View>}
      />}
    {!!data?.totalPages && data.totalPages > 1 && <View style={styles.row}>
      <Pressable disabled={pagina === 0} onPress={() => setPagina(pagina - 1)}><Text style={{ color: theme.primary }}>{copy.previous}</Text></Pressable>
      <Text style={{ color: theme.text }}>{pagina + 1} / {data.totalPages}</Text>
      <Pressable disabled={pagina + 1 >= data.totalPages} onPress={() => setPagina(pagina + 1)}><Text style={{ color: theme.primary }}>{copy.next}</Text></Pressable>
    </View>}
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18 }, title: { fontSize: 23, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 18, marginVertical: 12, alignItems: 'center' },
  item: { padding: 14, borderWidth: 1, borderRadius: 10, marginBottom: 10 },
  heading: { fontWeight: '700', fontSize: 17, marginBottom: 5 },
});
