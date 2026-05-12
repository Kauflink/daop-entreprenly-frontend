import { SubscriptionDashboardResponse } from './subscription-response';

const SHARED_LIMITS = [
  { id: 'products', label: 'subscription.limits.products.label', usedValue: 18, maxValue: 0 },
  { id: 'active-batches', label: 'subscription.limits.active-batches.label', usedValue: 6, maxValue: 0 },
  { id: 'users', label: 'subscription.limits.users.label', usedValue: 1, maxValue: 5 },
];

const SHARED_BILLING_SETUP = {
  paymentMethodTitle: 'subscription.billing.paymentMethod.title',
  paymentMethodDescription: 'subscription.billing.paymentMethod.emptyDescription',
  paymentMethodActionLabel: 'subscription.billing.paymentMethod.addAction',
  fiscalDataTitle: 'subscription.billing.fiscalData.title',
  fiscalDataDescription: 'subscription.billing.fiscalData.emptyDescription',
  fiscalDataActionLabel: 'subscription.billing.fiscalData.addAction',
  hasPaymentMethod: false,
  hasFiscalData: false,
};

const CONTROL_PLAN_FEATURES = [
  { description: 'subscription.plans.control.features.unlimitedProducts', available: true },
  { description: 'subscription.plans.control.features.salesOperations', available: true },
  { description: 'subscription.plans.control.features.chatbot', available: true },
];

export const SUBSCRIPTION_DASHBOARD_RESPONSE: SubscriptionDashboardResponse = {
  id: 1,
  defaultBillingCycle: 'monthly',
  currentPlan: {
    id: 'plan-free',
    name: 'Plan Free',
    shortDescription: 'subscription.plans.free.shortDescription',
    monthlyPrice: 0,
    annualPrice: 0,
    status: 'free',
    statusLabel: 'subscription.plans.free.status',
    badgeLabel: 'subscription.plans.current.badgeLabel',
    recommended: false,
    features: [
      { description: 'subscription.plans.free.features.basicInventory', available: true },
      { description: 'subscription.plans.free.features.manualMovements', available: true },
      { description: 'subscription.plans.free.features.noChatbot', available: true },
    ],
  },
  recommendedPlan: {
    id: 'plan-control',
    name: 'Plan Control',
    shortDescription: 'subscription.plans.control.shortDescription.recommended',
    monthlyPrice: 89,
    annualPrice: 890,
    status: 'active',
    statusLabel: 'subscription.plans.control.statusLabel.recommended',
    badgeLabel: 'subscription.plans.control.badgeLabel',
    recommended: true,
    features: CONTROL_PLAN_FEATURES,
  },
  limits: [
    { id: 'products', label: 'subscription.limits.products.label', usedValue: 18, maxValue: 40 },
    { id: 'active-batches', label: 'subscription.limits.active-batches.label', usedValue: 6, maxValue: 20 },
    { id: 'users', label: 'subscription.limits.users.label', usedValue: 1, maxValue: 1 },
  ],
  billingSetup: SHARED_BILLING_SETUP,
  activity: [
    {
      id: 'created-account',
      title: 'subscription.activity.created-account.title',
      detail: 'subscription.activity.created-account.detail',
    },
    {
      id: 'current-status',
      title: 'subscription.activity.current-status.title',
      detail: 'subscription.activity.current-status.detail.free',
    },
    {
      id: 'billing',
      title: 'subscription.activity.billing.title',
      detail: 'subscription.activity.billing.detail.free',
    },
  ],
};

export const ACTIVE_SUBSCRIPTION_DASHBOARD_RESPONSE: SubscriptionDashboardResponse = {
  id: 1,
  defaultBillingCycle: 'monthly',
  currentPlan: {
    id: 'plan-control',
    name: 'Plan Control',
<<<<<<< Updated upstream
    shortDescription:
      'Tu plan sigue activo hasta el 31 de mayo 2026. No se renovar\u00e1 autom\u00e1ticamente.',
=======
    shortDescription: 'subscription.plans.control.shortDescription.active',
>>>>>>> Stashed changes
    monthlyPrice: 89,
    annualPrice: 890,
    status: 'active',
    statusLabel: 'subscription.plans.control.statusLabel.active',
    badgeLabel: 'subscription.plans.current.badgeLabel',
    recommended: false,
<<<<<<< Updated upstream
    features: [
      {
        description: 'Productos y lotes ilimitados',
        available: true,
      },
      {
        description: 'Ventas, pedidos, caja y trazabilidad en un solo flujo.',
        available: true,
      },
      {
        description: 'Chatbot de WhatsApp y alertas operativas incluidas.',
        available: true,
      },
    ],
=======
    currentPeriodStartDate: '2026-05-10',
    currentPeriodEndDate: '2026-06-10',
    features: CONTROL_PLAN_FEATURES,
>>>>>>> Stashed changes
  },
  recommendedPlan: {
    id: 'plan-control',
    name: 'Plan Control',
    shortDescription: 'subscription.plans.control.shortDescription.recommended',
    monthlyPrice: 89,
    annualPrice: 890,
    status: 'active',
    statusLabel: 'subscription.plans.control.statusLabel.recommended',
    badgeLabel: 'subscription.plans.control.badgeLabel',
    recommended: true,
<<<<<<< Updated upstream
    features: [
      {
        description: 'Productos y lotes ilimitados',
        available: true,
      },
      {
        description: 'Ventas, pedidos, caja y trazabilidad en un solo flujo.',
        available: true,
      },
      {
        description: 'Chatbot de WhatsApp y alertas operativas incluidas.',
        available: true,
      },
    ],
  },
  limits: [
    {
      id: 'products',
      label: 'Productos',
      usedValue: 18,
      maxValue: 0,
    },
    {
      id: 'active-batches',
      label: 'Lotes activos',
      usedValue: 6,
      maxValue: 0,
    },
    {
      id: 'users',
      label: 'Usuarios',
      usedValue: 1,
      maxValue: 5,
    },
  ],
  billingSetup: {
    paymentMethodTitle: 'M\u00e9todo de pago',
    paymentMethodDescription: 'A\u00fan no hay tarjeta o medio de pago registrado.',
    paymentMethodActionLabel: 'Agregar m\u00e9todos de pago',
    fiscalDataTitle: 'Datos de facturaci\u00f3n',
    fiscalDataDescription: 'Completa RUC, raz\u00f3n social y correo de comprobantes.',
    fiscalDataActionLabel: 'Completar datos',
    hasPaymentMethod: false,
    hasFiscalData: false,
=======
    features: CONTROL_PLAN_FEATURES,
>>>>>>> Stashed changes
  },
  limits: SHARED_LIMITS,
  billingSetup: SHARED_BILLING_SETUP,
  activity: [
    {
      id: 'created-account',
<<<<<<< Updated upstream
      title: 'Cuenta creada',
      detail: '16 abril 2026 - Plan Free asignado autom\u00e1ticamente',
=======
      title: 'subscription.activity.created-account.title',
      detail: 'subscription.activity.created-account.detail',
>>>>>>> Stashed changes
    },
    {
      id: 'current-status',
      title: 'subscription.activity.current-status.title',
      detail: 'subscription.activity.current-status.detail.active',
    },
    {
      id: 'billing',
<<<<<<< Updated upstream
      title: 'Facturaci\u00f3n',
      detail: 'Pr\u00f3xima renovaci\u00f3n: 31 mayo 2026 - pago mensual',
    },
  ],
};
=======
      title: 'subscription.activity.billing.title',
      detail: 'subscription.activity.billing.detail.active-renewal',
    },
  ],
};

export const SCHEDULED_CANCELLATION_SUBSCRIPTION_DASHBOARD_RESPONSE: SubscriptionDashboardResponse =
  {
    ...ACTIVE_SUBSCRIPTION_DASHBOARD_RESPONSE,
    currentPlan: {
      ...ACTIVE_SUBSCRIPTION_DASHBOARD_RESPONSE.currentPlan,
      status: 'scheduled-cancellation',
      statusLabel: 'subscription.plans.control.statusLabel.scheduled-cancellation',
      shortDescription: 'subscription.plans.control.shortDescription.scheduled-cancellation',
    },
    activity: [
      ACTIVE_SUBSCRIPTION_DASHBOARD_RESPONSE.activity[0],
      {
        id: 'current-status',
        title: 'subscription.activity.current-status.title',
        detail: 'subscription.activity.current-status.detail.scheduled-cancellation',
      },
      {
        id: 'billing',
        title: 'subscription.activity.billing.title',
        detail: 'subscription.activity.billing.detail.cancelled',
      },
    ],
  };
>>>>>>> Stashed changes
