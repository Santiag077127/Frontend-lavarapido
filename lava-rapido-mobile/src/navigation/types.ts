
import type { Service } from '../features/services/types/service.types';
import type { ReservationResponse } from '../features/reservations/types/reservation.types';

export type RootStackParamList = {
  Landing: undefined;

  MainTabs: undefined;

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

  RegisterVehicle: undefined;

  Map: undefined;

  MyServices: undefined;

  ServiceDetails: {
    reservation: ReservationResponse;
  };

  EditProfile: undefined;
};

