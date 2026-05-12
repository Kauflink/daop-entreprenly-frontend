import { Routes } from '@angular/router';

// ───────────────── COMPONENTS ─────────────────

// Products
const ProductListComponent = () =>
  import('./product-list/product-list.component')
    .then(m => m.ProductListComponent);

const ProductForm = () =>
  import('./product-form/product-form.component')
    .then(m => m.ProductFormComponent); // fix: was missing `m =>`

const unitProductList = () =>
  import('./unit-product-list/unit-product-list.component')
    .then(m => m.UnitProductListComponent);

const unitProductForm = () =>
  import('./unit-product-form/unit-product-form.component')
    .then(m => m.UnitProductFormComponent);

const weightProductList = () =>
  import('./weight-product-list/weight-product-list.component')
    .then(m => m.WeightProductListComponent);

const weightProductForm = () =>
  import('./weight-product-form/weight-product-form.component')
    .then(m => m.WeightProductFormComponent);

// Lots
const LotListComponent = () =>
  import('./lot-list/lot-list.component')
    .then(m => m.LotListComponent);

const unitLotList = () =>
  import('./unit-lot-list/unit-lot-list.component')
    .then(m => m.UnitLotListComponent);

const unitLotForm = () =>
  import('./unit-lot-form/unit-lot-form.component')
    .then(m => m.UnitLotFormComponent);

const weightLotList = () =>
  import('./weight-lot-list/weight-lot-list.component')
    .then(m => m.WeightLotListComponent);

const weightLotForm = () =>
  import('./weight-lot-form/weight-lot-form.component')
    .then(m => m.WeightLotFormComponent);

// Alerts
const stockAlertList = () =>
  import('./stock-alert-list/stock-alert-list.component')
    .then(m => m.StockAlertListComponent);

// ───────────────── ROUTES ─────────────────

export const inventoryRoutes: Routes = [

  // PRODUCTS
  {
    path: 'products',
    loadComponent: ProductListComponent,
    title: 'pageTitle.inventory',
    children: [
      { path: 'new',             loadComponent: ProductForm,       title: 'pageTitle.newProduct'  },
      { path: 'edit/:id',        loadComponent: unitProductForm,   title: 'pageTitle.editProduct' },
      { path: 'weight-edit/:id', loadComponent: weightProductForm, title: 'pageTitle.editProduct' },
    ]
  },

  // UNIT PRODUCTS
  {
    path: 'unit-products',
    loadComponent: unitProductList,
    title: 'pageTitle.unitProducts',
    children: [
      { path: 'new',      loadComponent: unitProductForm, title: 'pageTitle.newProduct'  },
      { path: 'edit/:id', loadComponent: unitProductForm, title: 'pageTitle.editProduct' },
    ]
  },

  // WEIGHT PRODUCTS
  {
    path: 'weight-products',
    loadComponent: weightProductList,
    title: 'pageTitle.weightProducts',
    children: [
      { path: 'new',      loadComponent: weightProductForm, title: 'pageTitle.newProduct'  },
      { path: 'edit/:id', loadComponent: weightProductForm, title: 'pageTitle.editProduct' },
    ]
  },

  // LOTS
  {
    path: 'lots',
    loadComponent: LotListComponent,
    title: 'pageTitle.lots',
    children: [
      { path: 'unit-lots/new',   loadComponent: unitLotForm,   title: 'pageTitle.newLot' },
      { path: 'weight-lots/new', loadComponent: weightLotForm, title: 'pageTitle.newLot' },
    ]
  },

  // UNIT LOTS
  {
    path: 'unit-lots',
    loadComponent: unitLotList,
    title: 'pageTitle.unitLots',
    children: [
      { path: 'new',      loadComponent: unitLotForm, title: 'pageTitle.newLot'  },
      { path: 'edit/:id', loadComponent: unitLotForm, title: 'pageTitle.editLot' },
    ]
  },

  // WEIGHT LOTS
  {
    path: 'weight-lots',
    loadComponent: weightLotList,
    title: 'pageTitle.weightLots',
    children: [
      { path: 'new',      loadComponent: weightLotForm, title: 'pageTitle.newLot'  },
      { path: 'edit/:id', loadComponent: weightLotForm, title: 'pageTitle.editLot' },
    ]
  },

  // ALERTS
  { path: 'stock-alerts', loadComponent: stockAlertList, title: 'pageTitle.stockAlerts' },
];
