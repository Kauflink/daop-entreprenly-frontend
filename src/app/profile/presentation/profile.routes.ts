import { Routes } from '@angular/router';

export const profileRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/profile-page/profile-page').then((m) => m.ProfilePage),
    title: 'pageTitle.profile',
  },
];
