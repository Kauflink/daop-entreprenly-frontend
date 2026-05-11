export type BillingCardBrand =
  | 'visa'
  | 'mastercard'
  | 'american-express'
  | 'diners-club'
  | 'discover'
  | 'jcb'
  | 'unionpay'
  | 'unknown';

export interface BillingCardBrandInfo {
  id: BillingCardBrand;
  label: string;
  shortLabel: string;
  ariaLabel: string;
}

const CARD_BRANDS: Record<BillingCardBrand, BillingCardBrandInfo> = {
  visa: {
    id: 'visa',
    label: 'Visa',
    shortLabel: 'VISA',
    ariaLabel: 'Tarjeta Visa',
  },
  mastercard: {
    id: 'mastercard',
    label: 'Mastercard',
    shortLabel: 'MC',
    ariaLabel: 'Tarjeta Mastercard',
  },
  'american-express': {
    id: 'american-express',
    label: 'American Express',
    shortLabel: 'AMEX',
    ariaLabel: 'Tarjeta American Express',
  },
  'diners-club': {
    id: 'diners-club',
    label: 'Diners Club',
    shortLabel: 'DINERS',
    ariaLabel: 'Tarjeta Diners Club',
  },
  discover: {
    id: 'discover',
    label: 'Discover',
    shortLabel: 'DISC',
    ariaLabel: 'Tarjeta Discover',
  },
  jcb: {
    id: 'jcb',
    label: 'JCB',
    shortLabel: 'JCB',
    ariaLabel: 'Tarjeta JCB',
  },
  unionpay: {
    id: 'unionpay',
    label: 'UnionPay',
    shortLabel: 'UP',
    ariaLabel: 'Tarjeta UnionPay',
  },
  unknown: {
    id: 'unknown',
    label: 'Tarjeta',
    shortLabel: 'CARD',
    ariaLabel: 'Tarjeta',
  },
};

export function detectCardBrand(cardNumber: string): BillingCardBrandInfo {
  const digits = cardNumber.replace(/\D/g, '');

  if (/^4/.test(digits)) {
    return CARD_BRANDS.visa;
  }

  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) {
    return CARD_BRANDS.mastercard;
  }

  if (/^3[47]/.test(digits)) {
    return CARD_BRANDS['american-express'];
  }

  if (/^3(0[0-5]|[68])/.test(digits)) {
    return CARD_BRANDS['diners-club'];
  }

  if (/^(6011|65|64[4-9])/.test(digits)) {
    return CARD_BRANDS.discover;
  }

  if (/^(2131|1800|35)/.test(digits)) {
    return CARD_BRANDS.jcb;
  }

  if (/^62/.test(digits)) {
    return CARD_BRANDS.unionpay;
  }

  return CARD_BRANDS.unknown;
}

export function resolveCardBrand(cardBrand: string): BillingCardBrandInfo {
  const normalizedBrand = cardBrand.trim().toLowerCase();

  if (normalizedBrand.includes('visa')) {
    return CARD_BRANDS.visa;
  }

  if (normalizedBrand.includes('master')) {
    return CARD_BRANDS.mastercard;
  }

  if (normalizedBrand.includes('american') || normalizedBrand.includes('amex')) {
    return CARD_BRANDS['american-express'];
  }

  if (normalizedBrand.includes('diners')) {
    return CARD_BRANDS['diners-club'];
  }

  if (normalizedBrand.includes('discover')) {
    return CARD_BRANDS.discover;
  }

  if (normalizedBrand.includes('jcb')) {
    return CARD_BRANDS.jcb;
  }

  if (normalizedBrand.includes('union')) {
    return CARD_BRANDS.unionpay;
  }

  return CARD_BRANDS.unknown;
}

export interface BillingPaymentMethod {
  id: string;
  cardBrand: string;
  lastFour: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export interface BillingPaymentMethodInput {
  cardNumber: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
}

export interface BillingFiscalData {
  documentType: string;
  documentNumber: string;
  businessName: string;
  receiptEmail: string;
  fiscalAddress: string;
}

export class BillingSetup {
  paymentMethodTitle: string;
  paymentMethodDescription: string;
  paymentMethodActionLabel: string;
  fiscalDataTitle: string;
  fiscalDataDescription: string;
  fiscalDataActionLabel: string;
  hasPaymentMethod: boolean;
  hasFiscalData: boolean;
  paymentMethods: BillingPaymentMethod[];
  fiscalData: BillingFiscalData | null;

  constructor(setup?: Partial<BillingSetup>) {
    const paymentMethods = setup?.paymentMethods ?? [];

    this.paymentMethodTitle = setup?.paymentMethodTitle ?? '';
    this.paymentMethodDescription = setup?.paymentMethodDescription ?? '';
    this.paymentMethodActionLabel = setup?.paymentMethodActionLabel ?? '';
    this.fiscalDataTitle = setup?.fiscalDataTitle ?? '';
    this.fiscalDataDescription = setup?.fiscalDataDescription ?? '';
    this.fiscalDataActionLabel = setup?.fiscalDataActionLabel ?? '';
    this.paymentMethods = paymentMethods;
    this.fiscalData = setup?.fiscalData ?? null;
    this.hasPaymentMethod = setup?.hasPaymentMethod ?? paymentMethods.length > 0;
    this.hasFiscalData = setup?.hasFiscalData ?? this.fiscalData !== null;
  }
}
