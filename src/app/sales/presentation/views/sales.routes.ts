import { Routes } from '@angular/router';

const salesPage = () => import('./sales-page/sales-page').then((m) => m.SalesPage);

export const salesRoutes: Routes = [{ path: '', loadComponent: salesPage, title: 'pageTitle.sales' }];
