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
