/** locationService.ts — RF8: Geolocalización */
import api from './api';

export const locationService = {
  updateLocation: (operadorId: string, lat: number, lng: number) =>
    api.put(`/operators/${operadorId}/location`, { lat, lng }), // RF8.2
  getOperatorLocation: (orderId: string) =>
    api.get(`/orders/${orderId}/location`),                     // RF8.1
};

/** WebSocket para tracking en tiempo real — Patrón Observer (RF8.2) */
export const createTrackingSocket = (orderId: string) =>
  new WebSocket(`wss://api.lavarapido.com/tracking/${orderId}`);
