import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type PaymentSelection = 'CASH' | 'DIGITAL' | null;

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.html',
  styleUrl: './payment-method.css',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodComponent {
  readonly hasItems = input.required<boolean>();
  readonly selectedMethod = input.required<PaymentSelection>();
  readonly showError = input<boolean>(false);

  readonly methodSelected = output<'CASH' | 'DIGITAL'>();
  readonly finalizeSale = output<void>();
  readonly cancelSale = output<void>();
}
