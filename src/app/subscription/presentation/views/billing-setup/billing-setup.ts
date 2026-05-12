import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BillingSetup as BillingSetupEntity } from '../../../domain/model/billing-setup.entity';

@Component({
  selector: 'app-billing-setup',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './billing-setup.html',
  styleUrl: './billing-setup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingSetup {
  readonly billingSetup = input.required<BillingSetupEntity>();

  readonly paymentMethodRequested = output<void>();
  readonly fiscalDataRequested = output<void>();

  protected readonly primaryPaymentMethod = computed(
    () =>
      this.billingSetup().paymentMethods.find((paymentMethod) => paymentMethod.isDefault) ??
      this.billingSetup().paymentMethods.at(-1) ??
      null,
  );
  protected readonly fiscalData = computed(() => this.billingSetup().fiscalData);

  protected readonly hasPaymentMethod = computed(() => this.primaryPaymentMethod() !== null);
  protected readonly hasFiscalData = computed(() => this.fiscalData() !== null);
  protected readonly paymentActionLabel = computed(() =>
    this.hasPaymentMethod() ? 'Agregar métodos de pago' : this.billingSetup().paymentMethodActionLabel,
  );
  protected readonly fiscalActionLabel = computed(() =>
    this.hasFiscalData() ? 'Editar datos' : this.billingSetup().fiscalDataActionLabel,
  );
  protected readonly extraPaymentMethodCount = computed(() =>
    Math.max(this.billingSetup().paymentMethods.length - 1, 0),
  );

  protected requestPaymentMethod(): void {
    this.paymentMethodRequested.emit();
  }

  protected requestFiscalData(): void {
    this.fiscalDataRequested.emit();
  }
}
