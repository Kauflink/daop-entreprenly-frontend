import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { SubscriptionActivity as SubscriptionActivityEntity } from '../../../domain/model/subscription-activity.entity';

@Component({
  selector: 'app-subscription-activity',
  imports: [MatIconModule, TranslatePipe],
  templateUrl: './subscription-activity.html',
  styleUrl: './subscription-activity.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionActivity {
  readonly activity = input.required<SubscriptionActivityEntity[]>();

  readonly historyDownloadRequested = output<void>();

  protected requestHistoryDownload(): void {
    this.historyDownloadRequested.emit();
  }
}
