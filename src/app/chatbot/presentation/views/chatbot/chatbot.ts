import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ChatbotStoreService } from '../../../application/chatbot-store.service';
import { QrConnectionCard } from '../../components/qr-connection-card/qr-connection-card';
import { WhatsappStatusCard } from '../../components/whatsapp-status-card/whatsapp-status-card';

@Component({
  selector: 'app-chatbot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QrConnectionCard, WhatsappStatusCard],
  templateUrl: './chatbot.html',
})
export class Chatbot implements OnInit {
  protected readonly store = inject(ChatbotStoreService);

  ngOnInit(): void {
    this.store.loadSession();
  }
}
