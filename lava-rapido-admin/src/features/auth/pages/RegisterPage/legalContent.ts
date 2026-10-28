export const legalContent = {
  terms: {
    title: "Términos y condiciones",
    intro: "Bienvenido(a) a Lava Rápido. Al crear una cuenta y utilizar la aplicación, aceptas estas condiciones.",
    sections: [
      ["1. Aceptación", "Debes leer y aceptar estos términos antes de registrarte o reservar un servicio."],
      ["2. Servicio", "La plataforma permite consultar servicios de lavado vehicular, registrar vehículos, reservar turnos y consultar sus pagos y estados. La disponibilidad, duración y precio se muestran antes de confirmar cada reserva."],
      ["3. Uso permitido", "Debes proporcionar información verídica, respetar las reservas y utilizar la plataforma de forma lícita. No intentes acceder a cuentas ajenas ni interferir con el funcionamiento del servicio."],
      ["4. Cuenta y seguridad", "Eres responsable de mantener tu contraseña en secreto y de avisar al equipo de Lava Rápido si sospechas un acceso no autorizado."],
      ["5. Reservas y pagos", "Revisa los datos de tu vehículo, horario y servicio antes de confirmar. Los pagos se procesan mediante el proveedor mostrado en el flujo de pago. La confirmación de una reserva y la de un pago pueden ocurrir en momentos distintos."],
      ["6. Disponibilidad", "Podemos actualizar servicios y horarios. Si hay un error o interrupción, consulta el estado de la reserva antes de repetir un pago o crear otra reserva."],
      ["7. Contenido", "El diseño, nombre y contenido de Lava Rápido pertenecen a sus titulares y no pueden reutilizarse sin autorización."],
    ],
  },
  privacy: {
    title: "Política de privacidad",
    intro: "Esta política explica qué datos usa Lava Rápido para prestar sus servicios.",
    sections: [
      ["1. Datos tratados", "Al registrarte proporcionas nombre, apellidos, correo, teléfono, tipo y número de documento. Al usar la plataforma también se registran tus vehículos, reservas y datos necesarios para consultar el estado de los pagos. La contraseña se usa para autenticarte y no se muestra en tu perfil."],
      ["2. Finalidades", "Usamos estos datos para crear y proteger tu cuenta, gestionar reservas y vehículos, comunicar cambios del servicio y permitir la consulta de pagos."],
      ["3. Acceso y terceros", "El personal autorizado accede a la información necesaria para operar el servicio. Los pagos pueden requerir el tratamiento de datos por el proveedor de pagos indicado durante el proceso."],
      ["4. Tus opciones", "Desde tu perfil puedes revisar y actualizar los datos disponibles. Para consultas sobre tus datos o tu cuenta, comunícate con el equipo de Lava Rápido a través de los canales de atención publicados en la plataforma."],
      ["5. Seguridad", "Protegemos el acceso a la cuenta mediante autenticación y pedimos la contraseña actual para cambios sensibles, como el correo electrónico."],
    ],
  },
} as const;

export const legalContentByLanguage = {
  es: legalContent,
  en: {
    terms: {
      title: "Terms and conditions",
      intro: "Welcome to Lava Rápido. By creating an account and using the app, you accept these terms.",
      sections: [
        ["1. Acceptance", "Read and accept these terms before registering or booking a service."],
        ["2. Service", "The platform lets you browse car wash services, add vehicles, book appointments and check payment and booking status. Availability, duration and price are shown before you confirm a booking."],
        ["3. Permitted use", "Provide accurate information, respect your bookings and use the platform lawfully. Do not access another person's account or disrupt the service."],
        ["4. Account and security", "Keep your password private and tell the Lava Rápido team if you suspect unauthorized access."],
        ["5. Bookings and payments", "Review your vehicle, time and service before confirming. Payments are processed by the provider shown at checkout. Booking and payment confirmation may happen at different times."],
        ["6. Availability", "Services and schedules may change. If an error occurs, check the booking status before paying again or making another booking."],
        ["7. Content", "The Lava Rápido name, design and content belong to their owners and may not be reused without permission."],
      ],
    },
    privacy: {
      title: "Privacy policy",
      intro: "This policy explains which data Lava Rápido uses to provide its services.",
      sections: [
        ["1. Data we process", "Registration requires your name, email, phone number, document type and number. We also store vehicles, bookings and data needed to check payment status. Your password is used for authentication and is not shown in your profile."],
        ["2. Purposes", "We use this data to create and secure your account, manage vehicles and bookings, communicate service changes and let you check payments."],
        ["3. Access and third parties", "Authorized staff access the data needed to operate the service. The payment provider shown at checkout may process payment related data."],
        ["4. Your choices", "You can review and update available profile data. For questions about your data or account, contact the Lava Rápido team through the service channels shown in the platform."],
        ["5. Security", "We protect account access with authentication and require your current password for sensitive changes such as changing your email."],
      ],
    },
  },
  fr: {
    terms: {
      title: "Conditions générales",
      intro: "Bienvenue sur Lava Rápido. En créant un compte et en utilisant l'application, vous acceptez ces conditions.",
      sections: [
        ["1. Acceptation", "Lisez et acceptez ces conditions avant de vous inscrire ou de réserver un service."],
        ["2. Service", "La plateforme permet de consulter les services de lavage, d'ajouter des véhicules, de réserver et de suivre les paiements et les réservations. Disponibilité, durée et prix sont affichés avant confirmation."],
        ["3. Utilisation autorisée", "Fournissez des renseignements exacts, respectez vos réservations et utilisez la plateforme légalement. N'accédez pas aux comptes d'autrui et ne perturbez pas le service."],
        ["4. Compte et sécurité", "Gardez votre mot de passe confidentiel et informez l'équipe Lava Rápido de tout accès non autorisé suspecté."],
        ["5. Réservations et paiements", "Vérifiez le véhicule, l'horaire et le service avant de confirmer. Les paiements sont traités par le prestataire indiqué lors du paiement. La confirmation du paiement peut différer de celle de la réservation."],
        ["6. Disponibilité", "Les services et horaires peuvent changer. En cas d'erreur, vérifiez la réservation avant de payer ou de réserver à nouveau."],
        ["7. Contenu", "Le nom, le design et le contenu de Lava Rápido appartiennent à leurs titulaires et ne peuvent être réutilisés sans autorisation."],
      ],
    },
    privacy: {
      title: "Politique de confidentialité",
      intro: "Cette politique explique quelles données Lava Rápido utilise pour fournir ses services.",
      sections: [
        ["1. Données traitées", "L'inscription requiert votre nom, adresse e-mail, téléphone, type et numéro de document. Nous enregistrons aussi vos véhicules, réservations et les données nécessaires au suivi des paiements. Le mot de passe sert à l'authentification et n'apparaît pas dans le profil."],
        ["2. Finalités", "Ces données servent à créer et protéger votre compte, gérer véhicules et réservations, communiquer les changements et permettre le suivi des paiements."],
        ["3. Accès et tiers", "Le personnel autorisé accède aux données nécessaires au service. Le prestataire de paiement indiqué peut traiter les données liées aux paiements."],
        ["4. Vos choix", "Vous pouvez consulter et modifier les données disponibles dans votre profil. Pour toute question, contactez l'équipe Lava Rápido par les canaux affichés sur la plateforme."],
        ["5. Sécurité", "L'accès au compte est protégé par authentification. Le mot de passe actuel est requis pour les changements sensibles comme l'adresse e-mail."],
      ],
    },
  },
  pt: {
    terms: {
      title: "Termos e condições",
      intro: "Boas-vindas ao Lava Rápido. Ao criar uma conta e usar o aplicativo, você aceita estes termos.",
      sections: [
        ["1. Aceitação", "Leia e aceite estes termos antes de se cadastrar ou agendar um serviço."],
        ["2. Serviço", "A plataforma permite consultar serviços de lavagem, cadastrar veículos, agendar horários e acompanhar pagamentos e reservas. Disponibilidade, duração e preço são mostrados antes da confirmação."],
        ["3. Uso permitido", "Forneça informações verdadeiras, respeite suas reservas e use a plataforma legalmente. Não acesse contas de terceiros nem prejudique o serviço."],
        ["4. Conta e segurança", "Mantenha sua senha em sigilo e avise a equipe do Lava Rápido se suspeitar de acesso não autorizado."],
        ["5. Reservas e pagamentos", "Confira veículo, horário e serviço antes de confirmar. Os pagamentos são processados pelo provedor indicado na finalização. A confirmação do pagamento pode ocorrer em momento diferente da reserva."],
        ["6. Disponibilidade", "Serviços e horários podem mudar. Se ocorrer um erro, confira o estado da reserva antes de pagar ou reservar novamente."],
        ["7. Conteúdo", "O nome, design e conteúdo do Lava Rápido pertencem a seus titulares e não podem ser reutilizados sem autorização."],
      ],
    },
    privacy: {
      title: "Política de privacidade",
      intro: "Esta política explica quais dados o Lava Rápido usa para prestar seus serviços.",
      sections: [
        ["1. Dados tratados", "O cadastro exige nome, e-mail, telefone, tipo e número de documento. Também registramos veículos, reservas e dados necessários para consultar pagamentos. A senha é usada para autenticação e não aparece no perfil."],
        ["2. Finalidades", "Usamos esses dados para criar e proteger sua conta, gerenciar veículos e reservas, comunicar mudanças e permitir a consulta de pagamentos."],
        ["3. Acesso e terceiros", "Funcionários autorizados acessam os dados necessários ao serviço. O provedor de pagamentos indicado pode tratar dados relacionados ao pagamento."],
        ["4. Suas opções", "Você pode consultar e atualizar os dados disponíveis no perfil. Para dúvidas, contate a equipe do Lava Rápido pelos canais apresentados na plataforma."],
        ["5. Segurança", "Protegemos o acesso à conta por autenticação e exigimos a senha atual para mudanças sensíveis, como o e-mail."],
      ],
    },
  },
} as const;
