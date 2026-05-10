import { SubscriptionDashboardResponse } from './subscription-response';

export const SUBSCRIPTION_DASHBOARD_RESPONSE: SubscriptionDashboardResponse = {
  id: 1,
  defaultBillingCycle: 'monthly',
  currentPlan: {
    id: 'plan-free',
    name: 'Plan Free',
    shortDescription: 'Incluido automáticamente al crear la cuenta. No requiere tarjeta ni genera cargos.',
    monthlyPrice: 0,
    annualPrice: 0,
    status: 'free',
    statusLabel: 'Plan Free activo',
    badgeLabel: 'Plan actual',
    recommended: false,
    features: [
      {
        description: 'Inventario básico con productos y lotes limitados.',
        available: true,
      },
      {
        description: 'Registro manual de movimientos principales.',
        available: true,
      },
      {
        description: 'Sin chatbot de WhatsApp ni automatizaciones avanzadas.',
        available: true,
      },
    ],
  },
  recommendedPlan: {
    id: 'plan-control',
    name: 'Plan Control',
    shortDescription: 'Opera sin restricciones con automatizaciones, alertas y trazabilidad completa.',
    monthlyPrice: 89,
    annualPrice: 890,
    status: 'active',
    statusLabel: 'Recomendado',
    badgeLabel: 'Recomendado',
    recommended: true,
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
      maxValue: 40,
    },
    {
      id: 'active-batches',
      label: 'Lotes activos',
      usedValue: 6,
      maxValue: 20,
    },
    {
      id: 'users',
      label: 'Usuarios',
      usedValue: 1,
      maxValue: 1,
    },
  ],
  billingSetup: {
    paymentMethodTitle: 'Método de pago',
    paymentMethodDescription: 'Aún no hay tarjeta o medio de pago registrado.',
    paymentMethodActionLabel: 'Agregar método de pago',
    fiscalDataTitle: 'Datos de facturación',
    fiscalDataDescription: 'Completa RUC, razón social y correo de comprobantes.',
    fiscalDataActionLabel: 'Completar datos',
    hasPaymentMethod: false,
    hasFiscalData: false,
  },
  activity: [
    {
      id: 'created-account',
      title: 'Cuenta creada',
      detail: '16 abril 2026 - Plan Free asignado automáticamente',
    },
    {
      id: 'current-status',
      title: 'Estado actual',
      detail: 'Plan Free activo - Sin cargos registrados',
    },
    {
      id: 'billing',
      title: 'Facturación',
      detail: 'Pendiente de completar para actualizar a Plan Control',
    },
  ],
};
