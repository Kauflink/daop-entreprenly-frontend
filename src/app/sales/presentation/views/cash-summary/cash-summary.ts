import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { SalesStore } from '../../../application/sales-store';

@Component({
  selector: 'app-cash-summary',
  imports: [TranslatePipe],
  templateUrl: './cash-summary.html',
  styleUrl: './cash-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashSummary {
  protected readonly store = inject(SalesStore);
  protected readonly currency = inject(CurrencyService);
}
