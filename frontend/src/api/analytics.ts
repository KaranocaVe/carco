import { api } from './client';

export type SalesTrendPoint = {
  brandId: number;
  brandName: string;
  month: string;
  units: number;
  revenue: number;
  gender?: string;
  incomeBucket?: string;
};

export async function getSalesTrend(params: { start: string; end: string; segment?: boolean }) {
  const r = await api.get<SalesTrendPoint[]>('/api/analytics/sales/trend', { params });
  return r.data;
}

export type BrandTop = { brandId: number; brandName: string; units: number; revenue: number };
export async function getTopBrandsRevenue(params: { start: string; end: string; limit?: number }) {
  const r = await api.get<BrandTop[]>('/api/analytics/brands/top-revenue', { params });
  return r.data;
}
export async function getTopBrandsUnits(params: { start: string; end: string; limit?: number }) {
  const r = await api.get<BrandTop[]>('/api/analytics/brands/top-units', { params });
  return r.data;
}

export type ModelBestMonth = { modelName: string; month: string; units: number; revenue: number };
export async function getModelBestMonth(model: string, params: { start: string; end: string }) {
  const r = await api.get<ModelBestMonth>(`/api/analytics/models/${encodeURIComponent(model)}/best-month`, { params });
  return r.data;
}

export type DealerDwell = { dealerId: number; dealerName: string; avgDays: number; sampleSize: number };
export async function getDealerLongestDwell(params: { start: string; end: string; includeUnsold?: boolean }) {
  const r = await api.get<DealerDwell>('/api/analytics/dealers/longest-dwell', { params });
  return r.data;
}

export type ModelTop = { modelName: string; units: number; revenue: number };
export async function getTopModels(params: { start: string; end: string; limit?: number }) {
  const r = await api.get<ModelTop[]>('/api/analytics/models/top', { params });
  return r.data;
}
export async function getTopModelsByBrand(brand: string, params: { start: string; end: string; limit?: number }) {
  const r = await api.get<ModelTop[]>(`/api/analytics/brands/${encodeURIComponent(brand)}/models/top`, { params });
  return r.data;
}

export type DealerTop = { dealerId: number; dealerName: string; units: number; revenue: number };
export async function getTopDealersRevenue(params: { start: string; end: string; limit?: number }) {
  const r = await api.get<DealerTop[]>('/api/analytics/dealers/top-revenue', { params });
  return r.data;
}
export async function getTopDealersUnits(params: { start: string; end: string; limit?: number }) {
  const r = await api.get<DealerTop[]>('/api/analytics/dealers/top-units', { params });
  return r.data;
}

export type ColorTop = { colorId: number; colorName: string; units: number };
export async function getTopColors(params: { start: string; end: string; limit?: number }) {
  const r = await api.get<ColorTop[]>('/api/analytics/colors/top', { params });
  return r.data;
}

export type PriceSummary = { min: number; avg: number; median: number; p95: number; samples: number };
export async function getPriceSummary(params: { start: string; end: string; brand?: string; model?: string }) {
  const r = await api.get<PriceSummary>('/api/analytics/price/summary', { params });
  return r.data;
}

export type YoYMoM = { month: string; units: number; revenue: number; prevMonthUnits: number; prevMonthRevenue: number; prevYearUnits: number; prevYearRevenue: number };
export async function getYoY(params: { month: string }) {
  const r = await api.get<YoYMoM>('/api/analytics/sales/yoy', { params });
  return r.data;
}


