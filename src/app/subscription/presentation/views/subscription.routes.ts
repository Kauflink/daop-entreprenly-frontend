import { Routes } from '@angular/router';

export const subscriptionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./subscription-page/subscription-page').then((m) => m.SubscriptionPage),
  },
];
