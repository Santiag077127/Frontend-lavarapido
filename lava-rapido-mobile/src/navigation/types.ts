import type { Service } from '../features/services/types/service.types';

import type { ReservationResponse } from '../features/reservations/types/reservation.types';

import type { Vehicle } from '../services/vehicleService';

export type RootStackParamList = {
  Landing: undefined;

  MainTabs: undefined;

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

  MyReservations: undefined;

  Map: undefined;

  MyServices: undefined;

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
