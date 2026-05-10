import { Routes } from '@angular/router';

import { DashboardLayout } from './shared/presentation/components/dashboard-layout/dashboard-layout';

const baseTitle = 'Entreprenly';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./shared/presentation/views/home/home').then((m) => m.Home),
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('./sales/presentation/views/sales.routes').then((m) => m.salesRoutes),
        title: `${baseTitle} - Sales`,
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'home',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/presentation/views/page-not-found/page-not-found').then(
        (m) => m.PageNotFound,
      ),
  },
];
