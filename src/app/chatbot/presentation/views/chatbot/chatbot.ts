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
    this.store.refreshBridgeQr();
    // While not connected, keep refreshing the real QR and the link state so the
    // dashboard unlocks automatically once the WhatsApp bridge pairs.
    interval(3000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.store.session()?.status !== 'connected') {
          this.store.refreshBridgeQr();
        }
      });
  }

  protected onScanned(): void {
    this.store.simulateScan();
    this.justConnected.set(true);
  }

  protected onReconnect(): void {
    this.store.simulateDisconnect();
    this.justConnected.set(false);
  }
}
