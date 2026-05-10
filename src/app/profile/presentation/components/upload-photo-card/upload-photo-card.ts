import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-upload-photo-card',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload-photo-card.html',
  styleUrl: './upload-photo-card.css',
})
export class UploadPhotoCard {
  protected readonly store = inject(ProfileStore);
  protected readonly previewUrl = signal<string | null>(null);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  protected triggerFileInput(input: HTMLInputElement): void {
    input.click();
  }
}
