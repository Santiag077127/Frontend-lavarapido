// Recovery uses a one-time token from the API, not a six-digit verification code.
export const recoveryCopy = {
  es: {
    forgotPassword: {
      subtitle: 'Ingresa tu correo para recibir un enlace y un token de un solo uso.',
      sendCode: 'Enviar enlace',
      sentTitle: 'Solicitud recibida',
      sentMessage: 'Si el correo está registrado, recibirás un enlace y un token de un solo uso. Pega el token en la siguiente pantalla.',
      sendError: 'No se pudo solicitar la recuperación. Inténtalo de nuevo.',
    },
    resetPassword: {
      subtitle: 'Pega el token recibido por correo y elige una nueva contraseña.',
      token: 'Token recibido por correo',
      passwordRequirements: 'La contraseña debe tener al menos 8 unidades y un máximo de 72 bytes UTF-8.',
      resetError: 'Token inválido o vencido, o contraseña no válida. Solicita un nuevo enlace.',
      showPassword: 'Mostrar contraseña',
      hidePassword: 'Ocultar contraseña',
    },
  },
  en: {
    forgotPassword: {
      subtitle: 'Enter your email to receive a link and a one-time token.',
      sendCode: 'Send link',
      sentTitle: 'Request received',
      sentMessage: 'If the email is registered, you will receive a link and a one-time token. Paste the token on the next screen.',
      sendError: 'Could not request a reset. Please try again.',
    },
    resetPassword: {
      subtitle: 'Paste the token from the email and choose a new password.',
      token: 'Token from email',
      passwordRequirements: 'The password must have at least 8 units and no more than 72 UTF-8 bytes.',
      resetError: 'Invalid or expired token, or invalid password. Request a new link.',
      showPassword: 'Show password',
      hidePassword: 'Hide password',
    },
  },
  pt: {
    forgotPassword: {
      subtitle: 'Digite seu e-mail para receber um link e um token de uso único.',
      sendCode: 'Enviar link',
      sentTitle: 'Solicitação recebida',
      sentMessage: 'Se o e-mail estiver cadastrado, você receberá um link e um token de uso único. Cole o token na próxima tela.',
      sendError: 'Não foi possível solicitar a recuperação. Tente novamente.',
    },
    resetPassword: {
      subtitle: 'Cole o token recebido por e-mail e escolha uma nova senha.',
      token: 'Token recebido por e-mail',
      passwordRequirements: 'A senha deve ter pelo menos 8 unidades e no máximo 72 bytes UTF-8.',
      resetError: 'Token inválido ou expirado, ou senha inválida. Solicite um novo link.',
      showPassword: 'Mostrar senha',
      hidePassword: 'Ocultar senha',
    },
  },
  fr: {
    forgotPassword: {
      subtitle: 'Saisissez votre e-mail pour recevoir un lien et un jeton à usage unique.',
      sendCode: 'Envoyer le lien',
      sentTitle: 'Demande reçue',
      sentMessage: 'Si cet e-mail est enregistré, vous recevrez un lien et un jeton à usage unique. Collez le jeton sur l’écran suivant.',
      sendError: 'Impossible de demander la réinitialisation. Réessayez.',
    },
    resetPassword: {
      subtitle: 'Collez le jeton reçu par e-mail et choisissez un nouveau mot de passe.',
      token: 'Jeton reçu par e-mail',
      passwordRequirements: 'Le mot de passe doit comporter au moins 8 unités et au maximum 72 octets UTF-8.',
      resetError: 'Jeton invalide ou expiré, ou mot de passe invalide. Demandez un nouveau lien.',
      showPassword: 'Afficher le mot de passe',
      hidePassword: 'Masquer le mot de passe',
    },
  },
} as const;
