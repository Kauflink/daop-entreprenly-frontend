import { Component, effect, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { UnitLot } from '../../../domain/model/unit-lot.entity';
import { buildQrCodeDataUrl } from '../../../infrastructure/qr-code-generator';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-unit-lot-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, QrScannerComponent],
  templateUrl: './unit-lot-form.component.html',
  styleUrl: './unit-lot-form.component.css'
})
export class UnitLotFormComponent implements OnInit, OnDestroy {
  private fb    = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly store  = inject(InventoryStoreService);

  isEdit    = false;
  submitted = false;
  unitLotId: number | null = null;
  private readonly unitLotIdSignal = signal<number | null>(null);
  private hydratedLotId: number | null = null;

  form = this.fb.group({
    productId:  new FormControl<number>(0,  { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    quantity:   new FormControl<number>(0,  { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    qrCode:     new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    entryDate:  new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    expiryDate: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      const id = this.unitLotIdSignal();
      if (!id || this.hydratedLotId === id) return;

      const lot = this.store.unitLots().find(l => l.id === id);
      if (lot) {
        this.form.patchValue({
          productId:  lot.productId,
          quantity:   lot.quantity,
          qrCode:     lot.codeQR,
          entryDate:  new Date(lot.entryDate).toISOString().split('T')[0],
          expiryDate: new Date(lot.expiryDate).toISOString().split('T')[0],
        });
        this.hydratedLotId = id;
      }
    });
  }

  get selectedProduct() {
    const id = this.form.get('productId')?.value;
    return this.store.unitProducts().find(p => p.id === id) ?? null;
  }

  get qrImageUrl(): string {
    const value = this.form.controls.qrCode.value || this.createLotQrCode();
    return buildQrCodeDataUrl(value, 90);
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';

    const routeId        = this.route.snapshot.params['id'];
    const queryProductId = this.route.snapshot.queryParams['productId'];

    this.unitLotId = routeId ? +routeId : null;
    this.isEdit    = !!this.unitLotId;

    if (this.isEdit) {
      this.unitLotIdSignal.set(this.unitLotId);
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

    const lot = new UnitLot({
      _id:         this.unitLotId ?? Date.now(),
      _productId:  v.productId,
      _quantity:   v.quantity,
      _codeQR:     v.qrCode,
      _entryDate:  new Date(v.entryDate),
      _expiryDate: new Date(v.expiryDate),
    });

    this.isEdit ? this.store.updateUnitLot(lot) : this.store.addUnitLot(lot);
    this.closeModal();
  }

  closeModal(): void {
    const pId = this.form.get('productId')?.value
      || this.route.snapshot.queryParams['productId'];

    if (this.router.url.startsWith('/dashboard/inventory/lots/')) {
      this.router.navigate(['/dashboard/inventory/lots']);
      return;
    }

    this.router.navigate(['/dashboard/inventory/unit-lots'], {
      queryParams: { productId: pId }
    });
  }

  onQrScanned(value: string): void {
    this.form.patchValue({ qrCode: value });
    this.form.controls.qrCode.markAsDirty();
  }

  private createLotQrCode(): string {
    return `ULOT-${Date.now().toString(36).toUpperCase()}`;
  }
}
