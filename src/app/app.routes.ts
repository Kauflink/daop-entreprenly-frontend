import { Routes } from '@angular/router';

import { Home } from './shared/presentation/views/home/home';

const help = () => import('./shared/presentation/views/help/help').then((m) => m.Help);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then((m) => m.PageNotFound);
const baseTitle = 'Entreprenly';

export const routes: Routes = [
  { path: 'home', component: Home, title: `${baseTitle} - Home` },
  { path: 'help', loadComponent: help, title: `${baseTitle} - Help` },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];
