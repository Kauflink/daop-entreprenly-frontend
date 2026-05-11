import { Component, effect, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { WeightLot } from '../../../domain/model/weight-lot.entity';
import { buildQrCodeDataUrl } from '../../../infrastructure/qr-code-generator';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-weight-lot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, QrScannerComponent],
  templateUrl: './weight-lot-form.component.html',
  styleUrl: './weight-lot-form.component.css'
})
export class WeightLotFormComponent implements OnInit, OnDestroy {
  private fb    = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly store  = inject(InventoryStoreService);

  isEdit      = false;
  submitted   = false;
  weightLotId: number | null = null;
  private readonly weightLotIdSignal = signal<number | null>(null);
  private hydratedLotId: number | null = null;

  form = this.fb.group({
    productId:  new FormControl<number>(0,  { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    quantityKg: new FormControl<number>(0,  { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    qrCode:     new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    entryDate:  new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    // WeightLot no tiene expiryDate
  });

  constructor() {
    effect(() => {
      const id = this.weightLotIdSignal();
      if (!id || this.hydratedLotId === id) return;

      const lot = this.store.weightLots().find(l => l.id === id);
      if (lot) {
        this.form.patchValue({
          productId:  lot.productId,
          quantityKg: lot.quantityKg,
          qrCode:     lot.codeQR,
          entryDate:  new Date(lot.entryDate).toISOString().split('T')[0],
        });
        this.hydratedLotId = id;
      }
    });
  }

  get selectedProduct() {
    const id = this.form.get('productId')?.value;
    return this.store.weightProducts().find(p => p.id === id) ?? null;
  }

  get qrImageUrl(): string {
    const value = this.form.controls.qrCode.value || this.createLotQrCode();
    return buildQrCodeDataUrl(value, 90);
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';

    const routeId        = this.route.snapshot.params['id'];
    const queryProductId = this.route.snapshot.queryParams['productId'];

    this.weightLotId = routeId ? +routeId : null;
    this.isEdit      = !!this.weightLotId;

    if (this.isEdit) {
      this.weightLotIdSignal.set(this.weightLotId);
    } else {
      this.form.patchValue({ qrCode: this.createLotQrCode() });
      if (queryProductId) {
        this.form.patchValue({ productId: Number(queryProductId) });
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  submit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    const lot = new WeightLot({
      _id:         this.weightLotId ?? Date.now(),
      _productId:  v.productId,
      _quantityKg: v.quantityKg,
      _codeQR:     v.qrCode,
      _entryDate:  new Date(v.entryDate),
    });

    this.isEdit ? this.store.updateWeightLot(lot) : this.store.addWeightLot(lot);
    this.closeModal();
  }

  closeModal(): void {
    const pId = this.form.get('productId')?.value
      || this.route.snapshot.queryParams['productId'];

    if (this.router.url.startsWith('/dashboard/inventory/lots/')) {
      this.router.navigate(['/dashboard/inventory/lots']);
      return;
    }

    this.router.navigate(['/dashboard/inventory/weight-lots'], {
      queryParams: { productId: pId }
    });
  }

  onQrScanned(value: string): void {
    this.form.patchValue({ qrCode: value });
    this.form.controls.qrCode.markAsDirty();
  }

  private createLotQrCode(): string {
    return `WLOT-${Date.now().toString(36).toUpperCase()}`;
  }
}
