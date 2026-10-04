import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../../theme/ThemeContext';
import { formatCurrency } from '../../../utils/formatters';
import type { RootStackParamList } from '../../../navigation/types';
import { paymentService, type ReservationPayment, type WompiCheckoutData } from '../../../services/paymentService';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationPayment'>;

type WidgetTransactionDiagnostic = {
  id?: unknown;
  status?: unknown;
  reference?: unknown;
};

type WidgetEventMessage = {
  event: string;
  message?: unknown;
  resultType?: unknown;
  transaction?: WidgetTransactionDiagnostic | null;
};

type TransactionDiagnostic = {
  transactionId?: string;
  transactionStatus?: string;
  reference?: string;
};

type HttpFailure = {
  response?: { status?: number; data?: { error?: unknown } };
};

function makeWidgetHtml(checkout: WompiCheckoutData): string {
  const config = JSON.stringify({
    currency: checkout.moneda,
    amountInCents: checkout.montoEnCentavos,
    reference: checkout.referencia,
    publicKey: checkout.publicKey,
    signature: { integrity: checkout.firmaIntegridad },
  }).replace(/</g, '\\u003c');

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><style>html,body{margin:0;width:100%;min-height:100%;background:transparent}</style></head><body><p id="status">Preparando checkout seguro...</p><script>
    function notifyApp(event, details) {
      var payload = Object.assign({ event: event }, details || {});
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    }
    window.onerror = function () {
      notifyApp('javascript_error', { message: 'Error JavaScript durante el checkout' });
      return false;
    };
    window.onunhandledrejection = function () {
      notifyApp('javascript_error', { message: 'Error asíncrono durante el checkout' });
    };
    var scriptTimer = setTimeout(function () { notifyApp('checkout_script_timeout'); }, 15000);
    var widgetScript = document.createElement('script');
    widgetScript.src = 'https://checkout.wompi.co/widget.js';
    widgetScript.async = true;
    widgetScript.onload = function () {
      clearTimeout(scriptTimer);
      notifyApp('checkout_script_loaded');
      try {
        if (typeof window.WidgetCheckout !== 'function') throw new Error('WidgetCheckout unavailable');
        var checkout = new WidgetCheckout(${config});
        document.getElementById('status').textContent = '';
        checkout.open(function (result) {
          var transaction = result && result.transaction;
          var safeTransaction = null;
          if (transaction && typeof transaction === 'object') {
            safeTransaction = {};
            if (typeof transaction.id === 'string') safeTransaction.id = transaction.id;
            if (typeof transaction.status === 'string') safeTransaction.status = transaction.status;
            if (typeof transaction.reference === 'string') safeTransaction.reference = transaction.reference;
          }
          notifyApp('checkout_callback', { resultType: typeof result, transaction: safeTransaction });
          notifyApp('checkout_closed');
        });
        notifyApp('checkout_open_called');
      } catch (error) {
        notifyApp('checkout_init_error', { message: 'No fue posible inicializar el widget' });
      }
    };
    widgetScript.onerror = function () {
      clearTimeout(scriptTimer);
      notifyApp('checkout_script_error', { message: 'No se pudo cargar el script de Wompi' });
    };
    document.head.appendChild(widgetScript);
  </script></body></html>`;
}

export default function ReservationPaymentScreen({ route, navigation }: Props) {
  const { reservation } = route.params;
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [checkout, setCheckout] = useState<WompiCheckoutData | null>(null);
  const [payment, setPayment] = useState<ReservationPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [widgetOpened, setWidgetOpened] = useState(false);
  const [widgetError, setWidgetError] = useState(false);
  const [widgetReloadKey, setWidgetReloadKey] = useState(0);
  const [error, setError] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const requestLock = useRef(false);
  const initialCheckDone = useRef(false);
  const verificationLock = useRef(false);
  const isFinal = payment?.estado === 'aprobado' || payment?.estado === 'rechazado';

  const showRequestError = useCallback((requestError: unknown) => {
    // Keep technical/backend details out of the user-facing screen.
    void requestError;
    setStartError(t('mobile.paymentFlow.startError'));
    setError(true);
  }, [t]);

  const requestCheckout = useCallback(async () => {
    const data = await paymentService.start(reservation.idReserva);
    setCheckout(data);
    setWidgetOpened(false);
    setWidgetError(false);
    setError(false);
    console.info('[Wompi] Checkout prepared', {
      reservationId: data.idReserva,
      attemptId: data.idIntento,
      reused: data.reutilizado,
    });
  }, [reservation.idReserva]);

  // First read the existing backend state. Only an absent payment starts a new one.
  // For a pending payment, POST returns the same pending attempt and its widget data.
  const preparePayment = useCallback(async () => {
    if (requestLock.current) return;
    requestLock.current = true;
    setLoading(true);
    setError(false);
    setStartError(null);
    try {
      let existing: ReservationPayment | null = null;
      try {
        existing = await paymentService.getByReservation(reservation.idReserva);
        setPayment(existing);
      } catch (readError) {
        const status = (readError as HttpFailure).response?.status;
        if (status !== 404) throw readError;
      }

      if (existing?.estado === 'aprobado' || existing?.estado === 'rechazado') return;
      if (existing?.estado === 'pendiente') {
        await requestCheckout();
        return;
      }

      await requestCheckout();
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setLoading(false);
      requestLock.current = false;
    }
  }, [requestCheckout, reservation.idReserva, showRequestError]);

  const retryPayment = useCallback(async () => {
    if (requestLock.current) return;
    requestLock.current = true;
    setLoading(true);
    setError(false);
    setStartError(null);
    try {
      // This is only available after backend status is rejected; the backend owns retry rules.
      await requestCheckout();
      setPayment(null);
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setLoading(false);
      requestLock.current = false;
    }
  }, [requestCheckout, showRequestError]);

  const refreshStatus = useCallback(async () => {
    if (requestLock.current) return;
    requestLock.current = true;
    setChecking(true);
    setError(false);
    try {
      const data = await paymentService.getByReservation(reservation.idReserva);
      setPayment(data);
      if (data.estado !== 'pendiente') {
        setCheckout(null);
        setWidgetOpened(false);
      }
    } catch {
      setError(true);
    } finally {
      setChecking(false);
      requestLock.current = false;
    }
  }, [reservation.idReserva]);

  const resumePendingCheckout = useCallback(async () => {
    if (requestLock.current) return;
    requestLock.current = true;
    setLoading(true);
    setError(false);
    setStartError(null);
    try {
      const data = await paymentService.getByReservation(reservation.idReserva);
      setPayment(data);
      if (data.estado === 'pendiente') {
        // The backend reuses the current pending attempt and returns its widget data.
        await requestCheckout();
      } else {
        setCheckout(null);
        setWidgetOpened(false);
      }
    } catch (requestError) {
      showRequestError(requestError);
    } finally {
      setLoading(false);
      requestLock.current = false;
    }
  }, [requestCheckout, reservation.idReserva, showRequestError]);

  const verifyAfterCheckout = useCallback(async (diagnostic?: TransactionDiagnostic) => {
    if (verificationLock.current || requestLock.current) return;
    verificationLock.current = true;
    requestLock.current = true;
    setCheckout(null);
    setWidgetOpened(false);
    setWidgetError(false);
    setChecking(true);
    setError(false);
    try {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const data = await paymentService.getByReservation(reservation.idReserva);
          console.info('[Wompi] Backend payment status', {
            reservationId: reservation.idReserva,
            paymentId: data.idPago,
            paymentStatus: data.estado,
            attemptId: data.intentoActual?.idIntento,
            attemptStatus: data.intentoActual?.estado,
            transactionId: diagnostic?.transactionId,
            transactionStatus: diagnostic?.transactionStatus,
            reference: diagnostic?.reference,
          });
          setPayment(data);
          if (data.estado === 'aprobado' || data.estado === 'rechazado') return;
        } catch {
          setError(true);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } finally {
      setChecking(false);
      requestLock.current = false;
      verificationLock.current = false;
    }
  }, [reservation.idReserva]);

  useFocusEffect(useCallback(() => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      void preparePayment();
    }
    return undefined;
  }, [preparePayment]));

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && payment?.estado === 'pendiente' && !checkout) {
        void refreshStatus();
      }
    });
    return () => subscription.remove();
  }, [checkout, payment?.estado, refreshStatus]);

  const handleWidgetMessage = (event: WebViewMessageEvent) => {
    const rawMessage = event.nativeEvent.data;
    let message: WidgetEventMessage;
    try {
      const parsed: unknown = JSON.parse(rawMessage);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)
          || typeof (parsed as { event?: unknown }).event !== 'string') throw new Error('Unknown widget message');
      message = parsed as WidgetEventMessage;
    } catch {
      message = { event: rawMessage };
    }

    const transaction = message.transaction;
    const diagnostic: TransactionDiagnostic = {
      transactionId: typeof transaction?.id === 'string' ? transaction.id : undefined,
      transactionStatus: typeof transaction?.status === 'string' ? transaction.status : undefined,
      reference: typeof transaction?.reference === 'string' ? transaction.reference : undefined,
    };

    switch (message.event) {
      case 'checkout_script_loaded':
      case 'checkout_open_called':
        console.info('[Wompi] Widget event', {
          event: message.event,
          reservationId: reservation.idReserva,
          attemptId: checkout?.idIntento,
        });
        if (message.event === 'checkout_open_called') setWidgetOpened(true);
        return;
      case 'checkout_callback':
        console.info('[Wompi] Checkout callback', {
          reservationId: reservation.idReserva,
          attemptId: checkout?.idIntento,
          resultType: message.resultType,
          ...diagnostic,
        });
        void verifyAfterCheckout(diagnostic);
        return;
      case 'checkout_closed':
        void verifyAfterCheckout();
        return;
      case 'checkout_script_error':
      case 'checkout_script_timeout':
      case 'checkout_init_error':
      case 'javascript_error':
        console.error('[Wompi] Widget error', {
          event: message.event,
          reservationId: reservation.idReserva,
          attemptId: checkout?.idIntento,
        });
        setWidgetError(true);
        setWidgetOpened(false);
        return;
      default:
        console.warn('[Wompi] Unknown widget event', {
          event: /^[a-z_]{1,64}$/.test(message.event) ? message.event : 'invalid_event_name',
          reservationId: reservation.idReserva,
          attemptId: checkout?.idIntento,
        });
    }
  };

  const stateLabel = useMemo(() => {
    if (payment?.intentoActual?.estado === 'aprobado_duplicado') {
      return t('mobile.paymentFlow.duplicateApproval');
    }
    if (!payment) return t('mobile.paymentFlow.notConfirmed');
    if (payment.estado === 'aprobado') return t('mobile.paymentFlow.approved');
    if (payment.estado === 'rechazado') return t('mobile.paymentFlow.declined');
    return t('mobile.paymentFlow.pending');
  }, [payment, t]);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { borderColor: theme.border, backgroundColor: theme.card }]}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
          >
            <Text style={[styles.backText, { color: theme.text }]}>‹</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{t('mobile.paymentFlow.title')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.summaryTop}>
            <Text style={[styles.service, { color: theme.text }]} numberOfLines={1}>
              {reservation.nombreServicio || t('mobile.paymentFlow.service')}
            </Text>
            <Text style={[styles.amount, { color: theme.primary }]} numberOfLines={1}>
              {formatCurrency(reservation.precioServicio)}
            </Text>
          </View>
          <Text style={[styles.summaryDetail, { color: theme.textSecondary }]} numberOfLines={1}>
            {reservation.placaVehiculo} · {reservation.tipoVehiculo} · {reservation.fechaReserva} · {reservation.horaReserva.slice(0, 5)}
          </Text>
          <Text style={[styles.paymentStatus, { color: isFinal && payment?.estado === 'aprobado' ? theme.primary : theme.textSecondary }]} numberOfLines={1}>
            {stateLabel}
          </Text>
        </View>

        {checkout && !isFinal ? (
          <View style={[styles.checkout, { borderColor: theme.border }]}>
            <WebView
              key={widgetReloadKey}
              style={styles.webview}
              source={{ html: makeWidgetHtml(checkout) }}
              onLoadEnd={() => console.info('[Wompi] WebView document loaded', {
                reservationId: reservation.idReserva,
                attemptId: checkout.idIntento,
              })}
              onMessage={handleWidgetMessage}
              onError={(event) => {
                console.error('[Wompi] WebView load error', {
                  reservationId: reservation.idReserva,
                  attemptId: checkout.idIntento,
                  code: event.nativeEvent.code,
                  description: event.nativeEvent.description,
                });
                setWidgetError(true);
              }}
              onHttpError={(event) => {
                console.error('[Wompi] WebView HTTP error', {
                  reservationId: reservation.idReserva,
                  attemptId: checkout.idIntento,
                  statusCode: event.nativeEvent.statusCode,
                });
                setWidgetError(true);
              }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['https://*', 'about:*']}
            />
          </View>
        ) : (
          <View style={[styles.checkoutPlaceholder, { borderColor: theme.border, backgroundColor: theme.card }]}>
            {loading || checking ? (
              <>
                <ActivityIndicator color={theme.primary} size="large" />
                <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                  {loading ? t('mobile.paymentFlow.processing') : t('mobile.paymentFlow.checking')}
                </Text>
              </>
            ) : (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>{stateLabel}</Text>
            )}
          </View>
        )}

        <View style={styles.footer}>
          {widgetError && <Text style={[styles.error, { color: theme.errorText }]}>{t('mobile.paymentFlow.error')}</Text>}
          {error && <Text style={[styles.error, { color: theme.errorText }]}>{startError || t('mobile.paymentFlow.error')}</Text>}
          {payment?.intentoActual?.estado === 'aprobado_duplicado' && (
            <Text style={[styles.error, { color: theme.errorText }]}>{t('mobile.paymentFlow.duplicateHint')}</Text>
          )}

          {widgetError && checkout && !isFinal && (
            <Pressable
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => {
                setWidgetError(false);
                setWidgetReloadKey((value) => value + 1);
              }}
            >
              <Text style={styles.buttonText}>{t('mobile.paymentFlow.retry')}</Text>
            </Pressable>
          )}
          {checkout && widgetOpened && !checking && !isFinal && (
            <Pressable style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={() => void verifyAfterCheckout()}>
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('mobile.paymentFlow.checkAgain')}</Text>
            </Pressable>
          )}
          {!checkout && payment?.estado === 'pendiente' && !loading && (
            <>
              <Text style={[styles.hint, { color: theme.textSecondary }]}>{t('mobile.paymentFlow.pendingHint')}</Text>
              <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void refreshStatus()} disabled={checking}>
                <Text style={styles.buttonText}>{t('mobile.paymentFlow.checkAgain')}</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={() => void resumePendingCheckout()} disabled={checking}>
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('mobile.paymentFlow.continue')}</Text>
              </Pressable>
            </>
          )}
          {!payment && !checkout && !loading && (
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void preparePayment()} disabled={checking}>
              <Text style={styles.buttonText}>{t('mobile.paymentFlow.retry')}</Text>
            </Pressable>
          )}
          {payment?.estado === 'rechazado' && (
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void retryPayment()} disabled={loading}>
              <Text style={styles.buttonText}>{t('mobile.paymentFlow.retryPayment')}</Text>
            </Pressable>
          )}
          {isFinal && payment?.estado === 'aprobado' && (
            <Pressable style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('MainTabs', { screen: 'Reservas' })}>
              <Text style={styles.buttonText}>{t('mobile.paymentFlow.myReservations')}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8, gap: 8 },
  header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { width: 40, height: 40, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 32, lineHeight: 36, marginTop: -4 },
  title: { flex: 1, fontSize: 20, fontWeight: '700' },
  headerSpacer: { width: 8 },
  summary: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, gap: 4 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  service: { flex: 1, fontSize: 15, fontWeight: '700' },
  amount: { fontSize: 16, fontWeight: '800' },
  summaryDetail: { fontSize: 12 },
  paymentStatus: { fontSize: 12, fontWeight: '600' },
  checkout: { flex: 1, minHeight: 0, borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  webview: { flex: 1 },
  checkoutPlaceholder: { flex: 1, minHeight: 0, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 12 },
  placeholderText: { fontSize: 14, textAlign: 'center', paddingHorizontal: 16 },
  footer: { gap: 7 },
  error: { fontSize: 13, textAlign: 'center' },
  hint: { fontSize: 12, textAlign: 'center' },
  button: { minHeight: 46, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  secondaryButton: { minHeight: 42, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontWeight: '700', fontSize: 14 },
});
