import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { QrConnectionCard } from '../../components/qr-connection-card/qr-connection-card';
import { WhatsappStatusCard } from '../../components/whatsapp-status-card/whatsapp-status-card';
import { SubscriptionStore } from '../../../../subscription/application/subscription-store';

@Component({
  selector: 'app-chatbot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrConnectionCard, WhatsappStatusCard, RouterLink, TranslatePipe],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot implements OnInit {
  protected readonly store = inject(ChatbotStoreService);
  protected readonly subscriptionStore = inject(SubscriptionStore);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly justConnected = signal(false);
  protected readonly chatbotAllowed = computed(() => {
    const status = this.subscriptionStore.dashboard().currentPlan.status;
    return status === 'active' || status === 'scheduled-cancellation';
  });

  private readonly sessionLoader = effect(() => {
    if (this.chatbotAllowed() && !this.store.isSessionLoaded()) {
      this.store.loadSession();
    }
  });

  ngOnInit(): void {
    this.subscriptionStore.loadDashboard();

    // Check bridge health every 10 s while the app shows "connected" so that
    // unexpected disconnections (credentials expired, bridge restarted) are
    // detected automatically and the QR card is shown without a page reload.
    interval(10_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.chatbotAllowed() && this.store.isConnected()) {
          this.store.checkBridgeConnection();
        }
      });
  }

  protected onScanned(): void {
    this.store.markSessionConnected();
    this.justConnected.set(true);
  }

  protected onReconnect(): void {
    this.store.simulateDisconnect();
    this.justConnected.set(false);
  }
}
