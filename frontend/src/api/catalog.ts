import { api } from './client';

export type CatalogItem = { id: number; name: string };
export async function getBrands() { return (await api.get<CatalogItem[]>('/api/catalog/brands')).data; }
export async function getModelsByBrand(brand: string, opts?: { color?: string }) {
  const qs = new URLSearchParams();
  if (opts?.color) qs.set('color', opts.color);
  const q = qs.toString();
  const url = `/api/catalog/brands/${encodeURIComponent(brand)}/models${q ? `?${q}` : ''}`;
  return (await api.get<CatalogItem[]>(url)).data;
}
export async function getColors(opts?: { brand?: string; model?: string }) {
  const qs = new URLSearchParams();
  if (opts?.brand) qs.set('brand', opts.brand);
  if (opts?.model) qs.set('model', opts.model);
  const q = qs.toString();
  const url = `/api/catalog/colors${q ? `?${q}` : ''}`;
  return (await api.get<CatalogItem[]>(url)).data;
}
export async function getSuppliers(opts?: { brand?: string; model?: string; color?: string }) {
  const qs = new URLSearchParams();
  if (opts?.brand) qs.set('brand', opts.brand);
  if (opts?.model) qs.set('model', opts.model);
  if (opts?.color) qs.set('color', opts.color);
  const q = qs.toString();
  const url = `/api/catalog/suppliers${q ? `?${q}` : ''}`;
  return (await api.get<CatalogItem[]>(url)).data;
}
export type CatalogTransmission = { id: number; name: string; specCode: string };
export async function getTransmissions(opts?: { brand?: string; model?: string; color?: string }) {
  const qs = new URLSearchParams();
  if (opts?.brand) qs.set('brand', opts.brand);
  if (opts?.model) qs.set('model', opts.model);
  if (opts?.color) qs.set('color', opts.color);
  const q = qs.toString();
  const url = `/api/catalog/transmissions${q ? `?${q}` : ''}`;
  return (await api.get<CatalogTransmission[]>(url)).data;
}


