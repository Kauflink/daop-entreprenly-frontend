import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

@Component({
  selector: 'app-qr-connection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasError()) {
      <div class="m-5 rounded-2xl border border-red-200 bg-red-50 p-4">
        <p class="font-semibold text-red-600">Código QR expirado — vinculación no completada</p>
        <p class="mt-1 text-sm text-red-500">
          El código QR no fue escaneado en el tiempo límite de 60 segundos. El código anterior fue
          descartado automáticamente y se generó uno nuevo. Escanea el nuevo código para completar
          la vinculación.
        </p>
      </div>
    }
    <div class="flex flex-col items-center gap-3 py-20">
      <h2 class="text-lg font-bold text-gray-900">
        {{ hasError() ? 'Nuevo código generado' : 'Vincular WhatsApp Business' }}
      </h2>
      <p class="text-sm text-gray-500">Escanea el código QR desde tu app</p>
      <div class="flex h-48 w-48 items-center justify-center rounded-lg bg-black p-3">
        <svg viewBox="0 0 21 21" class="h-full w-full" fill="white" xmlns="http://www.w3.org/2000/svg" aria-label="Código QR">
          <rect x="0" y="0" width="7" height="7" rx="1"/>
          <rect x="1.5" y="1.5" width="4" height="4" fill="black"/>
          <rect x="2.5" y="2.5" width="2" height="2"/>
          <rect x="14" y="0" width="7" height="7" rx="1"/>
          <rect x="15.5" y="1.5" width="4" height="4" fill="black"/>
          <rect x="16.5" y="2.5" width="2" height="2"/>
          <rect x="0" y="14" width="7" height="7" rx="1"/>
          <rect x="1.5" y="15.5" width="4" height="4" fill="black"/>
          <rect x="2.5" y="16.5" width="2" height="2"/>
          <rect x="9" y="0" width="2" height="1"/><rect x="12" y="0" width="1" height="1"/>
          <rect x="9" y="2" width="1" height="2"/><rect x="11" y="2" width="2" height="1"/>
          <rect x="9" y="5" width="2" height="1"/><rect x="12" y="4" width="1" height="2"/>
          <rect x="8" y="8" width="2" height="2"/><rect x="11" y="8" width="2" height="1"/>
          <rect x="14" y="8" width="1" height="2"/><rect x="16" y="8" width="2" height="1"/>
          <rect x="19" y="8" width="2" height="2"/>
          <rect x="8" y="11" width="1" height="2"/><rect x="10" y="11" width="3" height="1"/>
          <rect x="14" y="11" width="2" height="1"/><rect x="17" y="11" width="1" height="2"/>
          <rect x="20" y="11" width="1" height="1"/>
          <rect x="9" y="14" width="2" height="1"/><rect x="12" y="14" width="2" height="1"/>
          <rect x="16" y="14" width="1" height="2"/><rect x="18" y="14" width="3" height="1"/>
          <rect x="9" y="16" width="1" height="2"/><rect x="11" y="16" width="2" height="2"/>
          <rect x="14" y="16" width="1" height="1"/><rect x="19" y="16" width="2" height="1"/>
          <rect x="8" y="19" width="3" height="2"/><rect x="13" y="19" width="2" height="1"/>
          <rect x="16" y="18" width="1" height="3"/><rect x="18" y="19" width="3" height="1"/>
        </svg>
      </div>
      <p class="text-sm" [class]="seconds() <= 10 ? 'text-red-400' : 'text-gray-400'">
        El código expira en {{ seconds() }} segundo{{ seconds() === 1 ? '' : 's' }}
      </p>
    </div>
  `,
})
export class QrConnectionCard {
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
  readonly expired = output<void>();

  protected readonly seconds = signal(120);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.seconds.update(s => {
          if (s <= 1) {
            this.expired.emit();
            return 0;
          }
          return s - 1;
        });
      });
  }
}
