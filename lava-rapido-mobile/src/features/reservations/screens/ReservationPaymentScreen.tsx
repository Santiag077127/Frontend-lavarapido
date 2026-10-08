import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import BackButton from '../../../components/common/BackButton';
import { ThemeContext } from '../../../theme/ThemeContext';
import type { RootStackParamList } from '../../../navigation/types';
import { paymentService, type ReservationPayment, type WompiCheckoutData } from '../../../services/paymentService';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationPayment'>;

type WidgetTransactionDiagnostic = {
  id?: unknown;
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
  reference?: string;
};

type HttpFailure = {
  response?: { status?: number; data?: { error?: unknown } };
};

function makeWidgetHtml(checkout: WompiCheckoutData, loadingText: string): string {
  const config = JSON.stringify({
    currency: checkout.moneda,
    amountInCents: checkout.montoEnCentavos,
    reference: checkout.referencia,
    publicKey: checkout.publicKey,
    signature: { integrity: checkout.firmaIntegridad },
  }).replace(/</g, '\\u003c');

  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:100%;height:100%;min-height:100%;background:transparent}body{overflow:auto}</style></head><body><p id="status">${loadingText}</p><script>
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
      if (diagnostic?.transactionId && diagnostic.reference) {
        try {
          const verified = await paymentService.verify(
            reservation.idReserva,
            diagnostic.reference,
            diagnostic.transactionId,
          );
          setPayment(verified);
          if (verified.estado === 'aprobado' || verified.estado === 'rechazado') return;
        } catch {
          // The webhook can still update the backend; continue reading its state.
        }
      }
      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const data = await paymentService.getByReservation(reservation.idReserva);

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
      reference: typeof transaction?.reference === 'string' ? transaction.reference : undefined,
    };

    switch (message.event) {
      case 'checkout_script_loaded':
      case 'checkout_open_called':

        if (message.event === 'checkout_open_called') setWidgetOpened(true);
        return;
      case 'checkout_callback':

        void verifyAfterCheckout(diagnostic);
        return;
      case 'checkout_closed':
        void verifyAfterCheckout();
        return;
      case 'checkout_script_error':
      case 'checkout_script_timeout':
      case 'checkout_init_error':
      case 'javascript_error':

        setWidgetError(true);
        setWidgetOpened(false);
        return;
      default:

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
        <View style={[styles.header, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <BackButton
            accessibilityLabel={t('mobile.serviceDetail.back')}
            onPress={() => navigation.goBack()}
          />
          <Text accessibilityRole="header" style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {t('mobile.paymentFlow.title')}
          </Text>
        </View>

        <View style={[styles.paymentIntro, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text accessibilityLiveRegion="polite" style={[styles.paymentStatus, { color: theme.textSecondary }]} numberOfLines={2}>{stateLabel}</Text>
        </View>

        {checkout && !isFinal ? (
          <View
            style={[
              styles.webViewContainer,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <WebView
              key={widgetReloadKey}
              style={styles.webview}
              source={{ html: makeWidgetHtml(checkout, t('mobile.paymentFlow.processing')) }}
              onMessage={handleWidgetMessage}
              onError={() => {
                setWidgetError(true);
              }}
              onHttpError={() => {
                setWidgetError(true);
              }}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['https://*', 'about:*']}
            />
          </View>
        ) : (
          <View
            style={[
              styles.checkoutPlaceholder,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <View style={[styles.checkoutGlyph, { backgroundColor: theme.primarySoft }]}>
              <Ionicons
                name={loading || checking ? 'shield-checkmark-outline' : 'card-outline'}
                size={28}
                color={theme.primary}
              />
            </View>
            {loading || checking ? (
              <>
                <ActivityIndicator color={theme.primary} size="large" />
                <Text accessibilityLiveRegion="polite" style={[styles.placeholderText, { color: theme.textSecondary }]}>
                  {loading ? t('mobile.paymentFlow.processing') : t('mobile.paymentFlow.checking')}
                </Text>
              </>
            ) : (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>{stateLabel}</Text>
            )}
          </View>
        )}

        {(!checkout || widgetError) && <View style={[styles.footer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {widgetError && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>{t('mobile.paymentFlow.error')}</Text>}
          {error && <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>{startError || t('mobile.paymentFlow.error')}</Text>}
          {payment?.intentoActual?.estado === 'aprobado_duplicado' && (
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { color: theme.errorText }]}>{t('mobile.paymentFlow.duplicateHint')}</Text>
          )}

          {widgetError && checkout && !isFinal && (
            <Pressable
              accessibilityRole="button"
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => {
                setWidgetError(false);
                setWidgetReloadKey((value) => value + 1);
              }}
            >
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.retry')}</Text>
            </Pressable>
          )}
          {checkout && widgetOpened && !checking && !isFinal && (
            <Pressable accessibilityRole="button" style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={() => void verifyAfterCheckout()}>
              <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('mobile.paymentFlow.checkAgain')}</Text>
            </Pressable>
          )}
          {!checkout && payment?.estado === 'pendiente' && !loading && (
            <>
              <Text style={[styles.hint, { color: theme.textSecondary }]}>{t('mobile.paymentFlow.pendingHint')}</Text>
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: checking, busy: checking }} style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void refreshStatus()} disabled={checking}>
                <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.checkAgain')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: checking, busy: checking }} style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={() => void resumePendingCheckout()} disabled={checking}>
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('mobile.paymentFlow.continue')}</Text>
              </Pressable>
            </>
          )}
          {!payment && !checkout && !loading && (
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: checking, busy: checking }} style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void preparePayment()} disabled={checking}>
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.retry')}</Text>
            </Pressable>
          )}
          {payment?.estado === 'rechazado' && (
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading, busy: loading }} style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void retryPayment()} disabled={loading}>
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.retryPayment')}</Text>
            </Pressable>
          )}
          {isFinal && payment?.estado === 'aprobado' && (
            <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('MainTabs', { screen: 'Reservas' })}>
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.myReservations')}</Text>
            </Pressable>
          )}
        </View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1 },
  header: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 8, marginHorizontal: 18, marginTop: 8, marginBottom: 14, borderWidth: 1, borderRadius: 18 },
  paymentIntro: { borderWidth: 1, borderRadius: 20, padding: 16, marginHorizontal: 16, marginBottom: 14, elevation: 1, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5 },
  title: { flex: 1, minWidth: 0, fontSize: 22, lineHeight: 28, fontWeight: '800' },
  paymentStatus: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  webViewContainer: { flex: 1, minHeight: 0, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderRadius: 20, overflow: 'hidden', elevation: 2 },
  webview: { flex: 1 },
  checkoutPlaceholder: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', gap: 14, marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 22, borderWidth: 1, borderRadius: 20, elevation: 1 },
  checkoutGlyph: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 16, fontWeight: '600' },
  footer: { gap: 9, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderRadius: 20, elevation: 1 },
  error: { fontSize: 13, textAlign: 'center' },
  hint: { fontSize: 12, textAlign: 'center' },
  button: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  buttonText: { fontWeight: '700', fontSize: 15 },
  secondaryButton: { minHeight: 48, borderWidth: 1, borderRadius: 15, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontWeight: '700', fontSize: 14 },
});
