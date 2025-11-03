import { api } from './client';

export type CatalogItem = { id: number; name: string };
export async function getBrands() { return (await api.get<CatalogItem[]>('/api/catalog/brands')).data; }
export async function getModelsByBrand(brand: string) { return (await api.get<CatalogItem[]>(`/api/catalog/brands/${encodeURIComponent(brand)}/models`)).data; }
export async function getColors() { return (await api.get<CatalogItem[]>('/api/catalog/colors')).data; }
export async function getSuppliers() { return (await api.get<CatalogItem[]>('/api/catalog/suppliers')).data; }
export type CatalogTransmission = { id: number; name: string; specCode: string };
export async function getTransmissions() { return (await api.get<CatalogTransmission[]>('/api/catalog/transmissions')).data; }


