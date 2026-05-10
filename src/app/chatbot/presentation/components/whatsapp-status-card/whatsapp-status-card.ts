import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WhatsappSession } from '../../../../domain/model/whatsapp-session.entity';

@Component({
  selector: 'app-whatsapp-status-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (justConnected()) {
      <div class="mb-4 rounded-lg border border-green-300 bg-green-50 p-4">
        <p class="font-semibold text-green-700">Cuenta vinculada correctamente</p>
        <p class="text-sm text-green-600">
          WhatsApp Business conectado exitosamente. El chatbot ya puede recibir y responder mensajes
          de tus clientes de forma automática.
        </p>
      </div>
    }
    @if (session()?.status === 'expired') {
      <div class="mb-4 rounded-lg border border-red-300 bg-red-50 p-4">
        <p class="font-semibold text-red-600">Sesión expirada</p>
        <p class="text-sm text-red-500">
          La sesión de WhatsApp Business fue cerrada externamente. El chatbot no puede recibir
          mensajes hasta que se restaure la conexión.
        </p>
      </div>
    }
    <div class="rounded-lg border border-gray-200 bg-white p-6">
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-1">
          <p class="font-semibold">WhatsApp Business</p>
          @if (session(); as s) {
            <p class="text-sm text-gray-500">
              {{ s.phone }}
              @if (s.status === 'connected' && s.connectedAt) {
                — activo desde el {{ s.connectedAt }}
              }
              @if (s.status === 'expired' && s.connectedAt) {
                — última conexión: {{ s.connectedAt }}
              }
              @if (s.businessName) {
                · {{ s.businessName }}
              }
            </p>
            @if (s.status === 'connected') {
              <p class="mt-1 text-sm text-gray-500">
                El chatbot se encuentra operativo y procesando mensajes automáticamente.
              </p>
            }
            @if (s.status === 'expired' || s.status === 'disconnected') {
              <button
                class="mt-3 w-fit rounded-full border border-orange-500 px-4 py-1 text-sm text-orange-500 hover:bg-orange-50"
                (click)="reconnect.emit()"
              >
                Volver a vincular
              </button>
            }
          }
        </div>
        @if (session(); as s) {
          <span
            class="rounded-full px-3 py-1 text-xs font-medium"
            [class]="
              s.status === 'connected'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            "
          >
            {{ s.status === 'connected' ? '● Conectado' : '● Desconectado' }}
          </span>
        }
      </div>
    </div>
  `,
})
export class WhatsappStatusCard {
  readonly session = input<WhatsappSession | null>(null);
  readonly justConnected = input<boolean>(false);
  readonly reconnect = output<void>();
}
