import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { QrConnectionCard } from '../../components/qr-connection-card/qr-connection-card';
import { WhatsappStatusCard } from '../../components/whatsapp-status-card/whatsapp-status-card';

@Component({
  selector: 'app-chatbot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrConnectionCard, WhatsappStatusCard, TranslatePipe],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot implements OnInit {
  protected readonly store = inject(ChatbotStoreService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly justConnected = signal(false);

  ngOnInit(): void {
    this.store.loadSession();

    // Check bridge health every 10 s while the app shows "connected" so that
    // unexpected disconnections (credentials expired, bridge restarted) are
    // detected automatically and the QR card is shown without a page reload.
    interval(10_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.store.isConnected()) {
          this.store.checkBridgeConnection();
        }
      });
  }

  protected onScanned(): void {
    this.store.loadSession();
    this.justConnected.set(true);
  }

  protected onReconnect(): void {
    this.store.simulateDisconnect();
    this.justConnected.set(false);
  }
}
