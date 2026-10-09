import type { ImageSourcePropType } from 'react-native';

import { images } from './images';

const serviceImages: Record<string, ImageSourcePropType> = {
  'lavado exterior basico': require('./Lavado Exterior Básico.jpg'),
  'lavado exterior a mano': require('./Lavado Exterior a Mano.jpg'),
  'lavado ecologico exterior': require('./Lavado Ecológico Exterior.jpg'),
  'lavado de rines y llantas': require('./Lavado de Rines y Llantas.jpg'),
  'descontaminado de pintura': require('./Descontaminado de Pintura.jpg'),
  'encerado y sellado': require('./Encerado y Sellado.jpg'),
  'aspirado general': require('./Aspirado General.jpg'),
  'limpieza de panel y consola': require('./Limpieza de Panel y Consola.jpg'),
  'higienizacion a vapor': require('./Higienización a Vapor.jpg'),
  'lavado de tapiceria': require('./Lavado de Tapicería.jpg'),
  'hidratacion de cuero': require('./Hidratación de Cuero.jpg'),
  'sanitizacion a c': require('./Sanitización AC.jpg'),
  'remocion de pelos de mascota': require('./Remoción de Pelos de Mascota.jpg'),
  'lavado de chasis': require('./Lavado de Chasis.jpg'),
  'desengrasado de bajos': require('./Desengrasado de Bajos.jpg'),
  'lavado de motor': require('./Lavado de Motor.jpg'),
  'combo express': require('./Combo Express.jpg'),
  'combo completo': require('./Combo Completo.jpg'),
  'combo ecologico': require('./Combo Ecológico.jpg'),
  'combo profundo sanitizado': require('./Combo Profundo Sanitizado.jpg'),
  'combo all inclusive': require('./Combo All-Inclusive.jpg'),
  'combo detailing premium': require('./Combo Detailing Premium.jpg'),
  'lavado premium': require('./Combo Detailing Premium.jpg'),
};

type ServiceImageScreen = 'HomeScreen' | 'ServiceDetailScreen';

interface ServiceImageRequestContext {
  serviceId: string;
  screen: ServiceImageScreen;
}

const normalizeServiceName = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const reportedUnknownRequests = new Set<string>();

/** Returns the local image for an exact normalized service name. */
export const getServiceImage = (
  name: string,
  context: ServiceImageRequestContext,
): ImageSourcePropType => {
  const normalizedName = normalizeServiceName(name);
  const image = serviceImages[normalizedName];

  if (image) return image;

  const reportKey = `${normalizedName}|${context.screen}|${context.serviceId}`;
  if (!reportedUnknownRequests.has(reportKey)) {
    reportedUnknownRequests.add(reportKey);
    console.warn(
      `[serviceImages] No local image mapped for service: "${name}" ` +
      `(serviceId: ${context.serviceId}, screen: ${context.screen})`,
    );
  }

  return images.ServicioBasico;
};
