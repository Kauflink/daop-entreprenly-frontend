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
        [class]="isEmpty() ? 'bg-gray-100' : 'bg-green-50'"
      >
        <input
          class="flex-1 bg-transparent text-sm outline-none"
          [class]="isEmpty() ? 'placeholder:text-gray-400' : 'placeholder:text-gray-400'"
          [placeholder]="isEmpty() ? 'El mensaje no puede estar vacío' : 'Escribe un mensaje...'"
          [(ngModel)]="text"
          (keyup.enter)="submit()"
          (input)="isEmpty.set(false)"
          aria-label="Escribe un mensaje"
        />
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
