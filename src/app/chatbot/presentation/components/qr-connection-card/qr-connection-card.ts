import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, timer } from 'rxjs';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-qr-connection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QRCodeComponent],
  template: `
    @if (isExpired() || hasError()) {
      <div class="m-5 rounded-2xl border border-red-200 bg-red-50 p-4">
        <p class="font-semibold text-red-600">Código QR expirado — vinculación no completada</p>
        <p class="mt-1 text-sm text-red-500">
          El código QR no fue escaneado en el tiempo límite. El código anterior fue descartado
          automáticamente y se generó uno nuevo. Escanea el nuevo código para completar la
          vinculación.
        </p>
      </div>
    }
    <div class="flex flex-col items-center gap-3 py-20">
      <h2 class="text-lg font-bold text-gray-900">
        {{ isExpired() || hasError() ? 'Nuevo código generado' : 'Vincular WhatsApp Business' }}
      </h2>
      <p class="text-sm text-gray-500">Escanea el código QR desde tu app</p>
      <div class="overflow-hidden rounded-xl">
        <qrcode
          [qrdata]="whatsappLink"
          [width]="192"
          [margin]="2"
          [errorCorrectionLevel]="'M'"
          [colorDark]="'#000000'"
          [colorLight]="'#ffffff'"
        />
      </div>
      <p class="text-sm" [class]="seconds() <= 10 ? 'font-medium text-red-400' : 'text-gray-400'">
        {{ isExpired() ? 'Generando nuevo código...' : 'El código expira en ' + seconds() + (seconds() === 1 ? ' segundo' : ' segundos') }}
      </p>
    </div>
  `,
})
export class QrConnectionCard {
  readonly hasError = input<boolean>(false);
  readonly phone = input<string>('+51999888777');
  readonly retry = output<void>();
  readonly expired = output<void>();

  protected readonly seconds = signal(120);
  protected readonly isExpired = signal(false);

  protected get whatsappLink(): string {
    const cleaned = this.phone().replace(/\s+/g, '').replace('+', '');
    return `https://wa.me/${cleaned}`;
  }

  private resetting = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (this.resetting) return;

        this.seconds.update(s => {
          if (s <= 1) {
            this.isExpired.set(true);
            this.expired.emit();
            this.resetting = true;

            timer(3000)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(() => {
                this.isExpired.set(false);
                this.seconds.set(120);
                this.resetting = false;
              });

            return 0;
          }
          return s - 1;
        });
      });
  }
}
