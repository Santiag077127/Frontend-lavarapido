import type { Service } from '../features/services/types/service.types';

import type { ReservationResponse } from '../features/reservations/types/reservation.types';

import type { Vehicle } from '../services/vehicleService';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Reservas: undefined;
  'Mis servicios': undefined;
  Mapa: undefined;
  Perfil: undefined;
};

export type RootStackParamList = {
  Landing: undefined;

  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  OperatorTabs: undefined;

  Login: undefined;

  Register: undefined;

  ForgotPassword: undefined;

  VerifyCode: undefined;

  ResetPassword: undefined;

  ServiceDetail: {
    service: Service;
  };

  Reservation: {
    service: Service;
  };

  ReservationPayment: {
    reservation: ReservationResponse;
  };

  Map: undefined;

  ServiceDetails: {
    reservation: ReservationResponse;
  };

  EditProfile: undefined;

  // Vehículos
  MyVehicles: undefined;

  AddVehicle:
    | undefined
    | {
        vehicle?: Vehicle;
      };
};
