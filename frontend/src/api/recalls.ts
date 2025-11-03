import { api } from './client';

export type RecallHit = { vin: string; serialNumber: string; productionDate: string; customerName?: string | null; saleDate?: string | null };

export async function getTransmissionRecall(params: { supplier: string; from: string; to: string }) {
  const r = await api.get<RecallHit[]>('/api/recalls/transmissions', { params });
  return r.data;
}

export async function getTransmissionRecallUnsold(params: { supplier: string; from: string; to: string }) {
  const r = await api.get<RecallHit[]>('/api/recalls/transmissions/unsold', { params });
  return r.data;
}

export type RecallByModel = { modelName: string; sold: number; unsold: number; total: number };
export async function getTransmissionRecallByModel(params: { supplier: string; from: string; to: string }) {
  const r = await api.get<RecallByModel[]>('/api/recalls/transmissions/by-model', { params });
  return r.data;
}


