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
        title: `${baseTitle} - Home`,
      },
      {
        path: 'help',
        loadComponent: () => import('./shared/presentation/views/help/help').then((m) => m.Help),
        title: `${baseTitle} - Help`,
      },
      {
        path: 'chatbot',
        loadChildren: () =>
          import('./chatbot/presentation/views/chatbot.routes').then(m => m.CHATBOT_ROUTES),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./chatbot/presentation/views/orders/orders').then(m => m.Orders),
        title: 'Entreprenly - Pedidos',
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
