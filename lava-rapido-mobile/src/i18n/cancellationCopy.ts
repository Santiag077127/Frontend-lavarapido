export const cancellationCopy = {
  es: {
    profile: {
      cancellationPolicy: 'Política de cancelación y devoluciones',
    },
    reservations: {
      cancelQuestion: 'Confirma que leíste la política de cancelación vigente. La solicitud solo procede para reservas pendientes sin pagos aprobados ni intentos pendientes.',
      alreadyCancelledTitle: 'Reserva ya cancelada',
      alreadyCancelledMessage: 'La reserva ya estaba cancelada.',
      pendingPaymentError: 'Hay un pago pendiente de confirmación. Por seguridad, la reserva no fue cancelada.',
      approvedPaymentError: 'La reserva tiene un pago aprobado y no puede cancelarse por esta opción.',
      notPendingError: 'Solo puedes cancelar voluntariamente una reserva pendiente.',
      forbiddenError: 'No tienes autorización para cancelar esta reserva.',
      notFoundError: 'No encontramos la reserva solicitada.',
    },
    reservation: {
      cancellationPolicySummary: 'Antes de confirmar, revisa las condiciones de cancelación, pagos pendientes y devoluciones.',
      readCancellationPolicy: 'Leer política de cancelación y devoluciones',
    },
    paymentFlow: {
      policySummary: 'Antes de continuar, confirma que leíste la política: un pago aprobado o pendiente impide cancelar la reserva hasta que se confirme su estado final.',
      policyVersion: 'Versión de la política: {{version}}',
      acceptAndContinue: 'Acepto la política y continuar',
      acceptAndRetry: 'Acepto la política y reintentar pago',
      exitMessage: 'Si sales, puedes solicitar la cancelación de la reserva pendiente. Al confirmar declaras que leíste la política; el servidor validará el estado del pago antes de decidir.',
      notPendingCancellationTitle: 'Reserva no cancelable',
      notPendingCancellationMessage: 'La reserva ya no está pendiente y no puede cancelarse por esta opción.',
    },
  },
  en: {
    profile: {
      cancellationPolicy: 'Cancellation and refund policy',
    },
    reservations: {
      cancelQuestion: 'Confirm that you read the current cancellation policy. The request is only available for pending reservations without approved payments or pending attempts.',
      alreadyCancelledTitle: 'Reservation already cancelled',
      alreadyCancelledMessage: 'The reservation was already cancelled.',
      pendingPaymentError: 'A payment is awaiting confirmation. For safety, the reservation was not cancelled.',
      approvedPaymentError: 'The reservation has an approved payment and cannot be cancelled through this option.',
      notPendingError: 'Only a pending reservation can be voluntarily cancelled.',
      forbiddenError: 'You are not authorized to cancel this reservation.',
      notFoundError: 'We could not find the requested reservation.',
    },
    reservation: {
      cancellationPolicySummary: 'Before confirming, review the cancellation, pending payment, and refund conditions.',
      readCancellationPolicy: 'Read cancellation and refund policy',
    },
    paymentFlow: {
      policySummary: 'Before continuing, review the policy: an approved or pending payment prevents cancellation until its final status is confirmed.',
      policyVersion: 'Policy version: {{version}}',
      acceptAndContinue: 'Accept policy and continue',
      acceptAndRetry: 'Accept policy and retry payment',
      exitMessage: 'If you leave, you may request cancellation of the pending reservation. By confirming, you state that you read the policy; the server will validate the payment status before deciding.',
      notPendingCancellationTitle: 'Reservation cannot be cancelled',
      notPendingCancellationMessage: 'The reservation is no longer pending and cannot be cancelled through this option.',
    },
  },
  pt: {
    profile: {
      cancellationPolicy: 'Política de cancelamento e reembolso',
    },
    reservations: {
      cancelQuestion: 'Confirme que leu a política de cancelamento vigente. A solicitação só está disponível para reservas pendentes sem pagamentos aprovados ou tentativas pendentes.',
      alreadyCancelledTitle: 'Reserva já cancelada',
      alreadyCancelledMessage: 'A reserva já estava cancelada.',
      pendingPaymentError: 'Há um pagamento aguardando confirmação. Por segurança, a reserva não foi cancelada.',
      approvedPaymentError: 'A reserva tem um pagamento aprovado e não pode ser cancelada por esta opção.',
      notPendingError: 'Somente uma reserva pendente pode ser cancelada voluntariamente.',
      forbiddenError: 'Você não tem autorização para cancelar esta reserva.',
      notFoundError: 'Não encontramos a reserva solicitada.',
    },
    reservation: {
      cancellationPolicySummary: 'Antes de confirmar, revise as condições de cancelamento, pagamentos pendentes e reembolsos.',
      readCancellationPolicy: 'Ler política de cancelamento e reembolso',
    },
    paymentFlow: {
      policySummary: 'Antes de continuar, leia a política: um pagamento aprovado ou pendente impede o cancelamento até que seu estado final seja confirmado.',
      policyVersion: 'Versão da política: {{version}}',
      acceptAndContinue: 'Aceitar política e continuar',
      acceptAndRetry: 'Aceitar política e tentar pagamento novamente',
      exitMessage: 'Ao sair, você pode solicitar o cancelamento da reserva pendente. Ao confirmar, declara que leu a política; o servidor validará o estado do pagamento antes de decidir.',
      notPendingCancellationTitle: 'Reserva não cancelável',
      notPendingCancellationMessage: 'A reserva não está mais pendente e não pode ser cancelada por esta opção.',
    },
  },
  fr: {
    profile: {
      cancellationPolicy: 'Politique d’annulation et de remboursement',
    },
    reservations: {
      cancelQuestion: 'Confirmez avoir lu la politique d’annulation en vigueur. La demande est réservée aux réservations en attente sans paiement approuvé ni tentative en attente.',
      alreadyCancelledTitle: 'Réservation déjà annulée',
      alreadyCancelledMessage: 'La réservation était déjà annulée.',
      pendingPaymentError: 'Un paiement attend une confirmation. Par sécurité, la réservation n’a pas été annulée.',
      approvedPaymentError: 'La réservation a un paiement approuvé et ne peut pas être annulée par cette option.',
      notPendingError: 'Seule une réservation en attente peut être annulée volontairement.',
      forbiddenError: 'Vous n’êtes pas autorisé à annuler cette réservation.',
      notFoundError: 'Nous n’avons pas trouvé la réservation demandée.',
    },
    reservation: {
      cancellationPolicySummary: 'Avant de confirmer, consultez les conditions d’annulation, de paiement en attente et de remboursement.',
      readCancellationPolicy: 'Lire la politique d’annulation et de remboursement',
    },
    paymentFlow: {
      policySummary: 'Avant de continuer, consultez la politique : un paiement approuvé ou en attente empêche l’annulation jusqu’à la confirmation de son état final.',
      policyVersion: 'Version de la politique : {{version}}',
      acceptAndContinue: 'Accepter la politique et continuer',
      acceptAndRetry: 'Accepter la politique et réessayer le paiement',
      exitMessage: 'Si vous quittez, vous pouvez demander l’annulation de la réservation en attente. En confirmant, vous déclarez avoir lu la politique ; le serveur vérifiera le paiement avant de décider.',
      notPendingCancellationTitle: 'Réservation non annulable',
      notPendingCancellationMessage: 'La réservation n’est plus en attente et ne peut pas être annulée par cette option.',
    },
  },
} as const;
