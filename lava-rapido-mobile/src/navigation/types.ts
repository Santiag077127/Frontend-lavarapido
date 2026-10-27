import type { Service } from '../features/services/types/service.types';

import type { ReservationResponse } from '../features/reservations/types/reservation.types';
import type { ReservationStatus } from '../features/reservations/types/reservation.types';

import type { Vehicle } from '../services/vehicleService';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  'Mis servicios': { initialStatus?: ReservationStatus } | undefined;
  Mapa: undefined;
  Perfil: undefined;
  Notificaciones: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  OperatorTabs: { screen: 'Notificaciones' } | undefined;

  Login: undefined;

  Register: undefined;

  ForgotPassword: undefined;


  ResetPassword: {
    token?: string;
  } | undefined;

  ServiceDetail: {
    service: Service;
  };

  Reservation: {
    service: Service;
  };

  ReservationPayment: {
    reservation: ReservationResponse;
    autoStart?: boolean;
  };

  Map: undefined;

  ServiceDetails: {
    reservation: ReservationResponse;
  };

  EditProfile: undefined;

  ChangePassword: undefined;

  // Vehículos
  MyVehicles: undefined;

  AddVehicle:
    | undefined
    | {
        vehicle?: Vehicle;
      };
};
