import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="border-t border-gray-200 bg-white px-4 py-3">
      <div
        class="flex items-center gap-2 rounded-full px-4 py-2.5"
        [class]="isEmpty() ? 'bg-gray-100' : 'bg-orange-50'"
      >
        <input
          class="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          [placeholder]="isEmpty() ? 'El mensaje no puede estar vacío' : 'Escribe un mensaje...'"
          [(ngModel)]="text"
          (keyup.enter)="submit()"
          (input)="isEmpty.set(false)"
          aria-label="Escribe un mensaje"
        />
        <button
          class="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          type="button"
          aria-label="Nota de voz"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
          </svg>
        </button>
        <button
          class="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
          type="button"
          aria-label="Adjuntar archivo"
        >
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>
        <button
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-700 text-white transition-colors hover:bg-green-800 disabled:opacity-40"
          [disabled]="!text.trim()"
          (click)="submit()"
          aria-label="Enviar mensaje"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class ChatInput {
  readonly messageSent = output<string>();

  protected text = '';
  protected readonly isEmpty = signal(false);

  protected submit(): void {
    if (!this.text.trim()) {
      this.isEmpty.set(true);
      return;
    }
    this.isEmpty.set(false);
    this.messageSent.emit(this.text.trim());
    this.text = '';
  }
}
