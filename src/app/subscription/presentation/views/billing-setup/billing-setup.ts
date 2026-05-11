import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
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

  protected requestPaymentMethod(): void {
    this.paymentMethodRequested.emit();
  }

  protected requestFiscalData(): void {
    this.fiscalDataRequested.emit();
  }
}
