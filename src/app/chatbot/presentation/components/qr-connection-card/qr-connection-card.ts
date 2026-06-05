import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { interval, timer } from 'rxjs';
import { buildQrCodeDataUrl } from '../../../../inventory/infrastructure/qr-code-generator';

@Component({
  selector: 'app-qr-connection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
  template: `
    @if ((isExpired() || hasError()) && !realMode()) {
      <div class="m-5 rounded-2xl border border-red-200 bg-red-50 p-4">
        <p class="font-semibold text-red-600">{{ 'chatbot.qr.expiredTitle' | translate }}</p>
        <p class="mt-1 text-sm text-red-500">{{ 'chatbot.qr.expiredDetail' | translate }}</p>
      </div>
    }
    <div class="flex flex-col items-center gap-3 py-20">
      <h2 class="text-lg font-bold text-gray-900">
        {{ ((isExpired() || hasError()) && !realMode() ? 'chatbot.qr.newCode' : 'chatbot.qr.linkTitle') | translate }}
      </h2>
      <p class="text-sm text-gray-500">{{ 'chatbot.qr.scanInstruction' | translate }}</p>
      <div class="overflow-hidden rounded-xl bg-white p-2">
        @if (qrCodeDataUrl()) {
          <img
            class="block size-48"
            [src]="qrCodeDataUrl()"
            width="192"
            height="192"
            [alt]="'chatbot.qr.alt' | translate"
          />
        } @else {
          <div class="flex size-48 items-center justify-center text-center text-sm text-gray-400">
            {{ 'chatbot.qr.generating' | translate }}
          </div>
        }
      </div>

      @if (realMode()) {
        <p class="text-sm text-gray-400">{{ 'chatbot.qr.scanInstruction' | translate }}</p>
      } @else {
        <p class="text-sm" [class]="seconds() <= 10 ? 'font-medium text-red-400' : 'text-gray-400'">
          @if (isExpired()) {
            {{ 'chatbot.qr.generating' | translate }}
          } @else {
            {{ (seconds() === 1 ? 'chatbot.qr.expiresInOne' : 'chatbot.qr.expiresIn') | translate: { seconds: seconds() } }}
          }
        </p>
        <button
          (click)="scanned.emit()"
          class="mt-2 rounded-full bg-green-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
          type="button"
        >
          {{ 'chatbot.qr.simulateScan' | translate }}
        </button>
      }
    </div>
  `,
})
export class QrConnectionCard {
  readonly hasError = input<boolean>(false);
  /** When true, the card renders the real pairing QR and hides the simulation controls. */
  readonly realMode = input<boolean>(false);
  /** Real QR payload relayed by the backend bridge (null until one is available). */
  readonly realToken = input<string | null>(null);
  readonly retry   = output<void>();
  readonly expired = output<void>();
  readonly scanned = output<void>();

  protected readonly seconds      = signal(120);
  protected readonly isExpired    = signal(false);
  /** Token de sesión temporal — se regenera cada vez que el QR expira (modo simulación) */
  protected readonly sessionToken = signal(this._generateToken());
  protected readonly qrCodeDataUrl = computed(() => {
    if (this.realMode()) {
      const real = this.realToken();
      return real ? buildQrCodeDataUrl(real, 192) : '';
    }
    return buildQrCodeDataUrl(this.sessionToken(), 192);
  });

  /** Genera un token de sesión único (mismo formato que WhatsApp Web) */
  private _generateToken(): string {
    const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const random = Array.from({ length: 8 }, () =>
      chars[Math.floor(Math.random() * chars.length)],
    ).join('');
    const ts = Math.floor(Date.now() / 1000);
    return `WA-SESSION-${random}-${ts}`;
  }

  private resetting = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.resetting || this.realMode()) return;

        this.seconds.update((seconds) => {
          if (seconds <= 1) {
            this.isExpired.set(true);
            this.expired.emit();
            this.resetting = true;

            timer(3000)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(() => {
                this.sessionToken.set(this._generateToken()); // nuevo token = nuevo QR
                this.isExpired.set(false);
                this.seconds.set(120);
                this.resetting = false;
              });

            return 0;
          }

          return seconds - 1;
        });
      });
  }
}
