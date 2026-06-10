import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { QrConnectionCard } from '../../components/qr-connection-card/qr-connection-card';
import { WhatsappStatusCard } from '../../components/whatsapp-status-card/whatsapp-status-card';

@Component({
  selector: 'app-chatbot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrConnectionCard, WhatsappStatusCard, TranslatePipe],
  templateUrl: './chatbot.html',
})
export class Chatbot implements OnInit {
  protected readonly store = inject(ChatbotStoreService);
  protected readonly justConnected = signal(false);

  ngOnInit(): void {
    this.store.loadSession();
  }

  protected onScanned(): void {
    // Bridge already updated the session status on the backend — just reload it.
    this.store.loadSession();
    this.justConnected.set(true);
  }

  protected onReconnect(): void {
    // Refresh the session status from the backend.
    this.store.loadSession();
    this.justConnected.set(false);
  }
}
