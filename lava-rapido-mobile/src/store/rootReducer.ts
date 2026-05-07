import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice';
import servicesReducer from '../features/services/slice';
import ordersReducer from '../features/orders/slice';
import trackingReducer from '../features/tracking/slice';
import profileReducer from '../features/profile/slice';

const rootReducer = combineReducers({
  auth: authReducer,
  services: servicesReducer,
  orders: ordersReducer,
  tracking: trackingReducer,
  profile: profileReducer,
});

export default rootReducer;
