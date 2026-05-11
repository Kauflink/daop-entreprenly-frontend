export class BillingSetup {
  paymentMethodTitle: string;
  paymentMethodDescription: string;
  paymentMethodActionLabel: string;
  fiscalDataTitle: string;
  fiscalDataDescription: string;
  fiscalDataActionLabel: string;
  hasPaymentMethod: boolean;
  hasFiscalData: boolean;

  constructor(setup?: Partial<BillingSetup>) {
    this.paymentMethodTitle = setup?.paymentMethodTitle ?? '';
    this.paymentMethodDescription = setup?.paymentMethodDescription ?? '';
    this.paymentMethodActionLabel = setup?.paymentMethodActionLabel ?? '';
    this.fiscalDataTitle = setup?.fiscalDataTitle ?? '';
    this.fiscalDataDescription = setup?.fiscalDataDescription ?? '';
    this.fiscalDataActionLabel = setup?.fiscalDataActionLabel ?? '';
    this.hasPaymentMethod = setup?.hasPaymentMethod ?? false;
    this.hasFiscalData = setup?.hasFiscalData ?? false;
  }
}
