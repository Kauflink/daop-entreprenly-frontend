import { Routes } from '@angular/router';

import { DashboardLayout } from './shared/presentation/components/dashboard-layout/dashboard-layout';
import { authGuard } from './auth/infrastructure/auth.guard';


export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/presentation/views/login/login').then((m) => m.Login),
    title: 'Entreprenly - Login',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/presentation/views/register/register').then((m) => m.Register),
    title: 'Entreprenly - Registro',
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./shared/presentation/views/home/home').then((m) => m.Home),
        title: 'pageTitle.home',
      },
      {
        path: 'help',
        loadComponent: () => import('./shared/presentation/views/help/help').then((m) => m.Help),
        title: 'pageTitle.help',
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./profile/presentation/profile.routes').then((m) => m.profileRoutes),
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('./sales/presentation/views/sales.routes').then((m) => m.salesRoutes),
      },
      {
        path: 'subscription',
        loadChildren: () =>
          import('./subscription/presentation/views/subscription.routes').then(
            (m) => m.subscriptionRoutes,
          ),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('./inventory/presentation/views/inventory.routes').then(
            (m) => m.inventoryRoutes,
          ),
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
        title: 'pageTitle.orders',
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
    pathMatch: 'full'
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/presentation/views/page-not-found/page-not-found').then(
        (m) => m.PageNotFound)
  },
];
