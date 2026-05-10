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
        loadComponent: () => import('./shared/presentation/views/home/home').then((m) => m.Home)
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./profile/presentation/profile.routes').then((m) => m.profileRoutes)
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('./sales/presentation/views/sales.routes').then((m) => m.salesRoutes)
      },
      {
        path: 'subscription',
        loadChildren: () =>
          import('./subscription/presentation/views/subscription.routes').then(
            (m) => m.subscriptionRoutes,
          )
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: '**',
        redirectTo: 'home'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/presentation/views/page-not-found/page-not-found').then(
        (m) => m.PageNotFound)
  },
];
