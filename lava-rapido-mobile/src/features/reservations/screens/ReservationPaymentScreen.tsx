import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { CommonActions, UNSTABLE_usePreventRemove, useFocusEffect } from '@react-navigation/native';
import type { NavigationAction } from '@react-navigation/routers';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ScreenHeader from '../../../components/common/ScreenHeader';
import ConfirmationModal from '../../../components/notifications/ConfirmationModal';
import { appAlert } from '../../../components/notifications/NotificationProvider';
import RegisterLegalDocumentModal from '../../auth/components/RegisterLegalDocumentModal';
import { ThemeContext } from '../../../theme/ThemeContext';
import type { RootStackParamList } from '../../../navigation/types';
import { paymentService, type ReservationPayment, type WompiCheckoutData } from '../../../services/paymentService';
import { pendingCheckoutRecovery } from '../../../services/pendingCheckoutRecovery';
import { classifyApiError } from '../../../services/api';
import {
  getReservationCancellationFailure,
  reservationService,
} from '../services/reservationService';
import type { ReservationStatus } from '../types/reservation.types';
import {
  CANCELLATION_POLICY_VERSION,
  createCancellationPolicyAcceptance,
} from '../../auth/legalContent';

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
  response?: { status?: number; data?: { code?: unknown } };
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
  const [exitConfirmationVisible, setExitConfirmationVisible] = useState(false);
  const [exitMode, setExitMode] = useState<'cancel' | 'approved'>('cancel');
  const [cancellingReservation, setCancellingReservation] = useState(false);
  const [allowRemoval, setAllowRemoval] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const requestLock = useRef(false);
  const cancellationLock = useRef(false);
  const initialCheckDone = useRef(false);
  const verificationLock = useRef(false);
  const pendingRemovalAction = useRef<NavigationAction | null>(null);
  const isFinal = payment?.estado === 'aprobado' || payment?.estado === 'rechazado';
  const approved = payment?.estado === 'aprobado' && payment.intentoActual?.estado !== 'aprobado_duplicado';

  UNSTABLE_usePreventRemove(!allowRemoval, ({ data }) => {
    if (cancellationLock.current) return;
    pendingRemovalAction.current = data.action;
    setExitMode(payment?.estado === 'aprobado' ? 'approved' : 'cancel');
    setExitConfirmationVisible(true);
  });

  React.useEffect(() => {
    if (!allowRemoval || !pendingRemovalAction.current) return;
    const action = pendingRemovalAction.current;
    pendingRemovalAction.current = null;
    navigation.dispatch(action);
  }, [allowRemoval, navigation]);

  const continuePayment = useCallback(() => {
    pendingRemovalAction.current = null;
    setExitConfirmationVisible(false);
  }, []);

  const navigateToServices = useCallback((initialStatus: ReservationStatus) => {
    pendingRemovalAction.current = CommonActions.navigate('MainTabs', {
      screen: 'Mis servicios',
      params: { initialStatus },
    });
    setExitConfirmationVisible(false);
    setAllowRemoval(true);
  }, []);

  const confirmExit = useCallback(async () => {
    if (payment?.estado === 'aprobado') {
      setExitMode('approved');
      if (exitMode !== 'approved') return;
      navigateToServices('PENDIENTE');
      return;
    }
    if (exitMode === 'approved') {
      navigateToServices('PENDIENTE');
      return;
    }
    if (cancellationLock.current) return;

    cancellationLock.current = true;
    setCancellingReservation(true);
    try {
      const outcome = await reservationService.cancelForCheckout(
        reservation.idReserva,
        createCancellationPolicyAcceptance(),
      );
      await pendingCheckoutRecovery.clear(reservation.idReserva, reservation.idUsuario).catch(() => {});
      setExitConfirmationVisible(false);
      if (outcome.result === 'CANCELLED') {
        appAlert.alert(
          t('mobile.paymentFlow.cancelledTitle'),
          t('mobile.paymentFlow.cancelledMessage'),
          undefined,
          'success',
        );
      } else {
        appAlert.alert(
          t('mobile.paymentFlow.alreadyCancelledTitle'),
          t('mobile.paymentFlow.alreadyCancelledMessage'),
          undefined,
          'info',
        );
      }
      navigateToServices('CANCELADA');
    } catch (requestError) {
      setExitConfirmationVisible(false);
      const failure = getReservationCancellationFailure(requestError);
      if (failure.status === 409 && failure.code === 'PAGO_PENDIENTE') {
        appAlert.alert(
          t('mobile.paymentFlow.pendingCancellationTitle'),
          t('mobile.paymentFlow.pendingCancellationMessage'),
          [
            {
              text: t('mobile.paymentFlow.viewReservations'),
              style: 'cancel',
              onPress: () => navigateToServices('PENDIENTE'),
            },
            { text: t('mobile.paymentFlow.continuePaying') },
          ],
          'warning',
        );
      } else if (failure.status === 409 && failure.code === 'PAGO_APROBADO') {
        appAlert.alert(
          t('mobile.paymentFlow.approvedExitTitle'),
          t('mobile.paymentFlow.approvedExitMessage'),
          [{
            text: t('mobile.paymentFlow.viewReservations'),
            onPress: () => navigateToServices('PENDIENTE'),
          }],
          'info',
        );
      } else if (failure.status === 409 && failure.code === 'RESERVA_NO_PENDIENTE') {
        appAlert.alert(
          t('mobile.paymentFlow.notPendingCancellationTitle'),
          t('mobile.paymentFlow.notPendingCancellationMessage'),
          [{
            text: t('mobile.paymentFlow.viewReservations'),
            onPress: () => navigateToServices('PENDIENTE'),
          }],
          'warning',
        );
      } else if (failure.status === 403) {
        appAlert.alert(
          t('mobile.paymentFlow.cancellationDeniedTitle'),
          t('mobile.paymentFlow.cancellationDeniedMessage'),
          [{
            text: t('mobile.paymentFlow.viewReservations'),
            onPress: () => navigateToServices('PENDIENTE'),
          }],
          'error',
        );
      } else if (failure.status === 404) {
        appAlert.alert(
          t('mobile.paymentFlow.reservationNotFoundTitle'),
          t('mobile.paymentFlow.reservationNotFoundMessage'),
          [{
            text: t('mobile.paymentFlow.viewReservations'),
            onPress: () => navigateToServices('PENDIENTE'),
          }],
          'warning',
        );
      } else {
        appAlert.alert(
          t('mobile.paymentFlow.cancelUnknownTitle'),
          t('mobile.paymentFlow.cancelUnknownMessage'),
          [{
            text: t('mobile.paymentFlow.viewReservations'),
            onPress: () => navigateToServices('PENDIENTE'),
          }],
          'warning',
        );
      }
    } finally {
      cancellationLock.current = false;
      setCancellingReservation(false);
    }
  }, [exitMode, navigateToServices, payment?.estado, reservation.idReserva, reservation.idUsuario, t]);

  const showRequestError = useCallback((requestError: unknown) => {
    // Keep technical/backend details out of the user-facing screen.
    const kind = classifyApiError(requestError);
    setStartError(['network', 'server_unavailable', 'timeout', 'server'].includes(kind)
      ? t(`apiErrors.${kind}`)
      : t('mobile.paymentFlow.startError'));
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
      // Persist before the first request so an Android process death during
      // checkout can be recovered from the server state on next launch.
      await pendingCheckoutRecovery.mark(reservation.idReserva, reservation.idUsuario).catch(() => {});
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
  }, [requestCheckout, reservation.idReserva, reservation.idUsuario, showRequestError]);

  React.useEffect(() => {
    if (payment?.estado !== 'aprobado') return;
    void pendingCheckoutRecovery.clear(reservation.idReserva, reservation.idUsuario).catch(() => {});
  }, [payment?.estado, reservation.idReserva, reservation.idUsuario]);

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
    } catch (requestError) {
      const status = (requestError as HttpFailure).response?.status;
      if (status === 404) {
        setPayment(null);
        setCheckout(null);
        setStartError(null);
      } else {
        showRequestError(requestError);
      }
    } finally {
      setChecking(false);
      requestLock.current = false;
    }
  }, [reservation.idReserva, showRequestError]);

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
      void refreshStatus();
    }
    return undefined;
  }, [refreshStatus]));

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
        <ScreenHeader
          accessibilityLabel={t('mobile.serviceDetail.back')}
          onBack={() => navigation.goBack()}
          style={{ marginHorizontal: 18, marginTop: 8 }}
          title={t('mobile.paymentFlow.title')}
        />

        {!checkout && !approved && (
          <View style={[styles.paymentIntro, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text accessibilityLiveRegion="polite" style={[styles.paymentStatus, { color: theme.textSecondary }]} numberOfLines={2}>{stateLabel}</Text>
            <Text style={[styles.policyText, { color: theme.textSecondary }]}>{t('mobile.paymentFlow.policySummary')}</Text>
            <Text style={[styles.policyVersion, { color: theme.textSecondary }]}>
              {t('mobile.paymentFlow.policyVersion', { version: CANCELLATION_POLICY_VERSION })}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => setTermsVisible(true)}
              style={styles.policyLink}
            >
              <Text style={[styles.policyLinkText, { color: theme.primary }]}>
                {t('mobile.reservation.readCancellationPolicy')}
              </Text>
            </Pressable>
          </View>
        )}

        {checkout && !isFinal ? (
          <View
            style={[
              styles.webViewContainer,
              styles.webViewContainerCheckout,
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
            <View style={[styles.checkoutGlyph, { backgroundColor: approved ? theme.successBackground : theme.primarySoft }]}>
              <Ionicons
                name={approved ? 'checkmark-circle-outline' : loading || checking ? 'shield-checkmark-outline' : 'card-outline'}
                size={28}
                color={approved ? theme.success : theme.primary}
              />
            </View>
            {approved ? (
              <>
                <Text accessibilityRole="header" style={[styles.approvedTitle, { color: theme.text }]}>{t('mobile.paymentFlow.approvedTitle')}</Text>
                <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>{t('mobile.paymentFlow.approvedMessage')}</Text>
              </>
            ) : loading || checking ? (
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
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('mobile.paymentFlow.acceptAndContinue')}</Text>
              </Pressable>
            </>
          )}
          {!payment && !checkout && !loading && (
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: checking, busy: checking }} style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void preparePayment()} disabled={checking}>
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.acceptAndContinue')}</Text>
            </Pressable>
          )}
          {payment?.estado === 'rechazado' && (
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: loading, busy: loading }} style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => void retryPayment()} disabled={loading}>
              <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.acceptAndRetry')}</Text>
            </Pressable>
          )}
          {approved && (
            <>
              <Pressable accessibilityRole="button" style={[styles.button, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('MainTabs', { screen: 'Mis servicios', params: { initialStatus: 'PENDIENTE' } })}>
                <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t('mobile.paymentFlow.myServices')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('mobile.paymentFlow.goHome')}</Text>
              </Pressable>
            </>
          )}
        </View>}
      </View>
      <ConfirmationModal
        visible={exitConfirmationVisible}
        title={exitMode === 'approved'
          ? t('mobile.paymentFlow.approvedExitTitle')
          : t('mobile.paymentFlow.exitTitle')}
        message={exitMode === 'approved'
          ? t('mobile.paymentFlow.approvedExitMessage')
          : t('mobile.paymentFlow.exitMessage')}
        confirmLabel={exitMode === 'approved'
          ? t('mobile.paymentFlow.viewReservations')
          : t('mobile.paymentFlow.exitAndCancel')}
        cancelLabel={t('mobile.paymentFlow.continuePaying')}
        onConfirm={() => void confirmExit()}
        onCancel={continuePayment}
        variant={exitMode === 'approved' ? 'normal' : 'warning'}
        busy={cancellingReservation}
        busyLabel={t('mobile.paymentFlow.cancellingReservation')}
      />
      <RegisterLegalDocumentModal
        document={termsVisible ? 'terms' : null}
        onClose={() => setTermsVisible(false)}
        surfaceColor={theme.card}
        textColor={theme.text}
        secondaryTextColor={theme.textSecondary}
        buttonColor={theme.primary}
        onPrimaryColor={theme.onPrimary}
      />
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
  policyText: { fontSize: 13, lineHeight: 19, marginTop: 10 },
  policyVersion: { fontSize: 12, lineHeight: 18, marginTop: 4, fontWeight: '600' },
  policyLink: { alignSelf: 'flex-start', paddingVertical: 6, marginTop: 2 },
  policyLinkText: { fontSize: 13, lineHeight: 18, fontWeight: '700', textDecorationLine: 'underline' },
  webViewContainer: { flex: 1, minHeight: 0, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderRadius: 20, overflow: 'hidden', elevation: 2 },
  webViewContainerCheckout: { marginHorizontal: 0, marginBottom: 0, borderWidth: 0, borderRadius: 0, elevation: 0 },
  webview: { flex: 1 },
  checkoutPlaceholder: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center', gap: 14, marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 22, borderWidth: 1, borderRadius: 20, elevation: 1 },
  checkoutGlyph: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 15, lineHeight: 22, textAlign: 'center', paddingHorizontal: 16, fontWeight: '600' },
  approvedTitle: { fontSize: 22, lineHeight: 28, textAlign: 'center', fontWeight: '800' },
  footer: { gap: 9, padding: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderRadius: 20, elevation: 1 },
  error: { fontSize: 13, textAlign: 'center' },
  hint: { fontSize: 12, textAlign: 'center' },
  button: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  buttonText: { fontWeight: '700', fontSize: 15 },
  secondaryButton: { minHeight: 48, borderWidth: 1, borderRadius: 15, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontWeight: '700', fontSize: 14 },
});
