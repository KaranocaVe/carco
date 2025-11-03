import { lazy, type ReactNode } from 'react';

const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const BrandsPage = lazy(() => import('../features/analytics/BrandsPage'));
const ModelsPage = lazy(() => import('../features/analytics/ModelsPage'));
const DealersPage = lazy(() => import('../features/analytics/DealersPage'));
const ColorsPage = lazy(() => import('../features/analytics/ColorsPage'));
const PricePage = lazy(() => import('../features/analytics/PricePage'));
const YoYPage = lazy(() => import('../features/analytics/YoYPage'));
const InventoryPage = lazy(() => import('../features/inventory/InventoryPage'));
const RecallsPage = lazy(() => import('../features/recalls/RecallsPage'));
const CatalogPage = lazy(() => import('../features/catalog/CatalogPage'));

export type RouteEntry = { path: string; element: ReactNode };
export const routes: RouteEntry[] = [
  { path: '/', element: <DashboardPage /> },
  { path: '/analytics/brands', element: <BrandsPage /> },
  { path: '/analytics/models', element: <ModelsPage /> },
  { path: '/analytics/dealers', element: <DealersPage /> },
  { path: '/analytics/colors', element: <ColorsPage /> },
  { path: '/analytics/price', element: <PricePage /> },
  { path: '/analytics/yoy', element: <YoYPage /> },
  { path: '/inventory', element: <InventoryPage /> },
  { path: '/recalls', element: <RecallsPage /> },
  { path: '/catalog', element: <CatalogPage /> },
];


