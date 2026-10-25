export type LegalDocument = 'privacy' | 'terms';

export type LegalSection = {
  title: string;
  body: string;
};

export type LegalDocumentContent = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export const legalContent: Record<LegalDocument, LegalDocumentContent> = {
  terms: {
    title: 'Términos y condiciones',
    intro: 'Bienvenido(a) a Lava Rápido. Al crear una cuenta y utilizar la aplicación, aceptas estas condiciones.',
    sections: [
      { title: '1. Aceptación', body: 'Debes leer y aceptar estos términos antes de registrarte o reservar un servicio.' },
      { title: '2. Servicio', body: 'La plataforma permite consultar servicios de lavado vehicular, registrar vehículos, reservar turnos y consultar sus pagos y estados. La disponibilidad, duración y precio se muestran antes de confirmar cada reserva.' },
      { title: '3. Uso permitido', body: 'Debes proporcionar información verídica, respetar las reservas y utilizar la plataforma de forma lícita. No intentes acceder a cuentas ajenas ni interferir con el funcionamiento del servicio.' },
      { title: '4. Cuenta y seguridad', body: 'Eres responsable de mantener tu contraseña en secreto y de avisar al equipo de Lava Rápido si sospechas un acceso no autorizado.' },
      { title: '5. Reservas y pagos', body: 'Revisa los datos de tu vehículo, horario y servicio antes de confirmar. Los pagos se procesan mediante el proveedor mostrado en el flujo de pago. La confirmación de una reserva y la de un pago pueden ocurrir en momentos distintos.' },
      { title: '6. Disponibilidad', body: 'Podemos actualizar servicios y horarios. Si hay un error o interrupción, consulta el estado de la reserva antes de repetir un pago o crear otra reserva.' },
      { title: '7. Contenido', body: 'El diseño, nombre y contenido de Lava Rápido pertenecen a sus titulares y no pueden reutilizarse sin autorización.' },
    ],
  },
  privacy: {
    title: 'Política de privacidad',
    intro: 'Esta política explica qué datos usa Lava Rápido para prestar sus servicios.',
    sections: [
      { title: '1. Datos tratados', body: 'Al registrarte proporcionas nombre, apellidos, correo, teléfono, tipo y número de documento. Al usar la plataforma también se registran tus vehículos, reservas y datos necesarios para consultar el estado de los pagos. La contraseña se usa para autenticarte y no se muestra en tu perfil.' },
      { title: '2. Finalidades', body: 'Usamos estos datos para crear y proteger tu cuenta, gestionar reservas y vehículos, comunicar cambios del servicio y permitir la consulta de pagos.' },
      { title: '3. Acceso y terceros', body: 'El personal autorizado accede a la información necesaria para operar el servicio. Los pagos pueden requerir el tratamiento de datos por el proveedor de pagos indicado durante el proceso.' },
      { title: '4. Tus opciones', body: 'Desde tu perfil puedes revisar y actualizar los datos disponibles. Para consultas sobre tus datos o tu cuenta, comunícate con el equipo de Lava Rápido a través de los canales de atención publicados en la plataforma.' },
      { title: '5. Seguridad', body: 'Protegemos el acceso a la cuenta mediante autenticación y pedimos la contraseña actual para cambios sensibles, como el correo electrónico.' },
    ],
  },
};
