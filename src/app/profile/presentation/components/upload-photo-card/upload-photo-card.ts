import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileStore } from '../../../application/profile-store';

const MAX_DIMENSION = 256; // px; keeps the stored base64 small
const JPEG_QUALITY = 0.85;

@Component({
  selector: 'app-upload-photo-card',
  imports: [MatIconModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './upload-photo-card.html',
  styleUrl: './upload-photo-card.css',
})
export class UploadPhotoCard {
  protected readonly store = inject(ProfileStore);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly saving = signal(false);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    this.saving.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const dataUrl = this.resizeToDataUrl(img);
        this.previewUrl.set(dataUrl);
        this.store.updateProfile({ avatarUrl: dataUrl });
        this.saving.set(false);
        input.value = '';
      };
      img.onerror = () => this.saving.set(false);
      img.src = reader.result as string;
    };
    reader.onerror = () => this.saving.set(false);
    reader.readAsDataURL(file);
  }

  /** Scales the image down to fit MAX_DIMENSION and returns a JPEG data URI. */
  private resizeToDataUrl(img: HTMLImageElement): string {
    let width = img.width;
    let height = img.height;
    if (width > height && width > MAX_DIMENSION) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    } else if (height > MAX_DIMENSION) {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  protected triggerFileInput(input: HTMLInputElement): void {
    input.click();
  }
}
