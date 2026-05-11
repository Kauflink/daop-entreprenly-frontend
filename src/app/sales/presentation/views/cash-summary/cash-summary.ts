import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SalesStore } from '../../../application/sales-store';

@Component({
  selector: 'app-cash-summary',
  templateUrl: './cash-summary.html',
  styleUrl: './cash-summary.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashSummary {
  protected readonly store = inject(SalesStore);
}
