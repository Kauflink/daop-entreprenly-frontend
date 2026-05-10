import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="border-t border-gray-200 p-4">
      <div
        class="flex items-center gap-2 rounded-full border px-4 py-2"
        [class]="isEmpty() ? 'border-red-300 bg-red-50' : 'border-orange-300 bg-orange-50'"
      >
        <input
          class="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          [placeholder]="isEmpty() ? 'El mensaje no puede estar vacío' : 'Escribe un mensaje...'"
          [(ngModel)]="text"
          (keyup.enter)="submit()"
          aria-label="Escribe un mensaje"
        />
        <button
          class="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white transition-colors hover:bg-green-700 disabled:opacity-40"
          [disabled]="!text.trim()"
          (click)="submit()"
          aria-label="Enviar mensaje"
        >
          ▶
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
