import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-qr-connection-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hasError()) {
      <div class="mb-4 rounded-lg border border-red-300 bg-red-50 p-4">
        <p class="font-semibold text-red-600">Código QR expirado — vinculación no completada</p>
        <p class="text-sm text-red-500">
          El código QR no fue escaneado en el tiempo límite de 60 segundos. El código anterior fue
          descartado automáticamente y se generó uno nuevo. Escanea el nuevo código para completar
          la vinculación.
        </p>
      </div>
    }
    <div class="flex flex-col items-center gap-4 py-16">
      <h2 class="text-lg font-semibold">
        {{ hasError() ? 'Nuevo código generado' : 'Vincular WhatsApp Business' }}
      </h2>
      <p class="text-sm text-gray-500">Escanea el código QR desde tu app</p>
      <div class="flex h-48 w-48 items-center justify-center rounded-lg bg-black">
        <span class="text-xs text-white">QR</span>
      </div>
      <p class="text-sm text-gray-400">El código expira en 60 segundos</p>
    </div>
  `,
})
export class QrConnectionCard {
  readonly hasError = input<boolean>(false);
  readonly retry = output<void>();
}
