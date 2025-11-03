import { api } from './client';

export type UnsoldVehicle = { vin: string; dealerId: number; dealerName: string; receivedAt: string; daysInInventory: number };
export async function getUnsold(params: { asOf: string; dealerId?: number; page?: number; pageSize?: number }) {
  const r = await api.get<UnsoldVehicle[]>('/api/inventory/unsold', { params });
  return r.data;
}

export type AgeingBucket = { bucket: string; count: number };
export async function getAgeing(params: { asOf: string; dealerId?: number }) {
  const r = await api.get<AgeingBucket[]>('/api/inventory/ageing', { params });
  return r.data;
}


