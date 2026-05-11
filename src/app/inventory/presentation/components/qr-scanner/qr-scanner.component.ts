import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, OnDestroy, Output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Html5Qrcode, Html5QrcodeSupportedFormats, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import { TranslatePipe } from '@ngx-translate/core';

let scannerId = 0;

@Component({
  selector: 'app-qr-scanner',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.css'
})
export class QrScannerComponent implements OnDestroy {
  @Output() scanned = new EventEmitter<string>();

  private readonly cdr = inject(ChangeDetectorRef);
  private html5QrCode: Html5Qrcode | null = null;

  readonly readerId = `qr-scanner-reader-${++scannerId}`;
  readonly scannerOpen = signal(false);
  readonly scanning = signal(false);
  readonly errorKey = signal<string | null>(null);

  async openScanner(): Promise<void> {
    this.errorKey.set(null);
    await this.stopScanner();

    this.scannerOpen.set(true);
    this.cdr.detectChanges();

    try {
      this.html5QrCode = new Html5Qrcode(this.readerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });

      const config: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: { width: 200, height: 200 },
      };

      await this.html5QrCode.start(
        { facingMode: 'environment' },
        config,
        decodedText => {
          const value = decodedText.trim();
          if (!value) return;
          this.scanned.emit(value);
          void this.stopScanner();
        },
        () => undefined
      );

      this.scanning.set(true);
    } catch (error) {
      this.errorKey.set(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'products.form.scannerPermissionDenied'
          : 'products.form.scannerCameraUnavailable'
      );
      await this.stopScanner();
    }
  }

  closeScanner(): void {
    void this.stopScanner();
  }

  ngOnDestroy(): void {
    void this.stopScanner();
  }

  private async stopScanner(): Promise<void> {
    this.scanning.set(false);

    const scanner = this.html5QrCode;
    this.html5QrCode = null;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // The scanner can already be stopped while the camera is closing.
      }

      try {
        scanner.clear();
      } catch {
        // Ignore cleanup races from html5-qrcode internals.
      }
    }

    this.scannerOpen.set(false);
  }
}
