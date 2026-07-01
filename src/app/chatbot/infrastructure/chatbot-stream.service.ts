import { Injectable, NgZone, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from '../../auth/application/auth-store';
import { Conversation } from '../domain/model/conversation.entity';
import { ChatMessage } from '../domain/model/chat-message.entity';
import { ChatOrder } from '../domain/model/chat-order.entity';

/**
 * Server-Sent Events client for the chatbot realtime stream.
 *
 * Opens a single {@link EventSource} against the backend and re-emits the
 * `message`, `conversation` and `order` events as typed observables so the
 * store can update its state immediately, without polling.
 */
@Injectable({ providedIn: 'root' })
export class ChatbotStreamService {
  private readonly zone = inject(NgZone);
  private readonly auth = inject(AuthStore);

  private readonly messageSubject = new Subject<ChatMessage>();
  private readonly conversationSubject = new Subject<Conversation>();
  private readonly orderSubject = new Subject<ChatOrder>();

  readonly messages$: Observable<ChatMessage> = this.messageSubject.asObservable();
  readonly conversations$: Observable<Conversation> = this.conversationSubject.asObservable();
  readonly orders$: Observable<ChatOrder> = this.orderSubject.asObservable();

  private source: EventSource | null = null;

  private get streamUrl(): string {
    return `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderChatbotStreamEndpointPath}`;
  }

  /** Opens the stream once; subsequent calls are no-ops while it stays open. */
  connect(): void {
    if (this.source || typeof EventSource === 'undefined') return;

    // EventSource cannot send an Authorization header, so the JWT travels as a
    // query parameter; the backend validates it before opening the stream.
    const token = this.auth.token;
    if (!token) return;

    const url = `${this.streamUrl}?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);
    this.source = source;

    source.addEventListener('message', e => this.emit(this.messageSubject, e));
    source.addEventListener('conversation', e => this.emit(this.conversationSubject, e));
    source.addEventListener('order', e => this.emit(this.orderSubject, e));
    source.onerror = () => {
      // The browser reconnects automatically; nothing else to do here.
    };
  }

  /** Closes the stream and releases the connection. */
  disconnect(): void {
    this.source?.close();
    this.source = null;
  }

  private emit<T>(subject: Subject<T>, event: MessageEvent): void {
    let payload: T;
    try {
      payload = JSON.parse(event.data) as T;
    } catch {
      return;
    }
    // EventSource callbacks run outside Angular; re-enter so signals refresh the view.
    this.zone.run(() => subject.next(payload));
  }
}
