import { ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { interval, startWith, switchMap, catchError, of } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { buildQrCodeDataUrl } from '../../../../inventory/infrastructure/qr-code-generator';

interface BridgeQrState {
  qr: string | null;
  connected: boolean;
}

/**
 * Polls the backend bridge-QR endpoint every 5 seconds and renders the real
 * WhatsApp pairing QR code. Emits (scanned) as soon as the bridge reports
 * that the phone has completed the scan and WhatsApp is connected.
 */
@Component({
  selector: 'app-qr-connection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    <div class="flex flex-col items-center gap-3 py-20">
      <h2 class="text-lg font-bold text-gray-900">
        {{ 'chatbot.qr.linkTitle' | translate }}
      </h2>
      <p class="text-sm text-gray-500">{{ 'chatbot.qr.scanInstruction' | translate }}</p>

      @if (qrDataUrl()) {
        <div class="overflow-hidden rounded-xl bg-white p-2 shadow-sm">
          <img
            class="block size-48"
            [src]="qrDataUrl()!"
            width="192"
            height="192"
            [alt]="'chatbot.qr.alt' | translate"
          />
        </div>
      } @else {
        <div class="flex size-48 items-center justify-center rounded-xl bg-gray-50">
          <svg class="h-10 w-10 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      }

      <p class="text-sm text-gray-400">{{ 'chatbot.qr.waitingForBridge' | translate }}</p>
    </div>
  `,
})
export class QrConnectionCard {
  /** Emitted when the bridge reports that the phone completed the QR scan. */
  readonly scanned = output<void>();

  private readonly http        = inject(HttpClient);
  private readonly destroyRef  = inject(DestroyRef);
  private readonly bridgeQrUrl = `${environment.entreprenlyProviderApiBaseUrl}/chatbot/whatsapp/bridge/qr`;

  protected readonly qrDataUrl = signal<string | null>(null);

  constructor() {
    // Poll every 5 seconds; start immediately (startWith(0)).
    interval(5000).pipe(
      startWith(0),
      switchMap(() =>
        this.http.get<BridgeQrState>(this.bridgeQrUrl).pipe(
          catchError(() => of<BridgeQrState>({ qr: null, connected: false })),
        ),
      ),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(state => {
      if (state.connected) {
        this.scanned.emit();
        return;
      }
      if (state.qr) {
        try {
          this.qrDataUrl.set(buildQrCodeDataUrl(state.qr, 192));
        } catch {
          this.qrDataUrl.set(null);
        }
      }
    });
  }
}
