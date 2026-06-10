import { Component, effect, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { UnitProduct } from '../../../domain/model/unit-product.entity';
import { buildQrCodeDataUrl } from '../../../infrastructure/qr-code-generator';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-unit-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, QrScannerComponent],
  templateUrl: './unit-product-form.component.html',
  styleUrl: './unit-product-form.component.css'
})
export class UnitProductFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _store = inject(InventoryStoreService);
  protected readonly currency = inject(CurrencyService);

  isEdit = false;
  submitted = false;
  unitProductId: number | null = null;
  private readonly unitProductIdSignal = signal<number | null>(null);
  private hydratedProductId: number | null = null;

  form = this.fb.group({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    codeQR: new FormControl('', { nonNullable: true }),
    price: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    weightGrams: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    brand: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.unitProductId = params['id'] ? +params['id'] : null;
      this.unitProductIdSignal.set(this.unitProductId);
      this.isEdit = !!this.unitProductId;
      this.hydratedProductId = null;
    });

    effect(() => {
      const id = this.unitProductIdSignal();
      if (!id || this.hydratedProductId === id) return;

      const product = this._store.unitProducts().find(p => p.id === id);
      if (product) {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          codeQR: product.codeQR,
          price: product.price,
          weightGrams: product.weightGrams,
          brand: product.brand
        });
        this.hydratedProductId = id;
      }
    });
  }

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
    if (!this.isEdit) {
      this.ensureQrCode();
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }

  submit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    this.ensureQrCode();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();

    const product = new UnitProduct({
      _id: this.unitProductId ?? Date.now(),
      _name: v.name,
      _description: v.description,
      _codeQR: v.codeQR || v.name,
      _price: v.price,
      _weightGrams: v.weightGrams,
      _brand: v.brand
    });

    this.isEdit ? this._store.updateUnitProduct(product) : this._store.addUnitProduct(product);
    this.goBack();
  }

  goBack(): void {
    const path = this.router.url.startsWith('/dashboard/inventory/unit-products')
      ? ['/dashboard/inventory/unit-products']
      : ['/dashboard/inventory/products'];
    this.router.navigate(path);
  }

  get qrImageUrl(): string {
    return buildQrCodeDataUrl(this.form.controls.codeQR.value, 130);
  }

  onQrScanned(value: string): void {
    this.form.patchValue({ codeQR: value });
    this.form.controls.codeQR.markAsDirty();
  }

  private ensureQrCode(): void {
    if (!this.form.controls.codeQR.value.trim()) {
      this.form.patchValue({ codeQR: this.createProductQrCode() });
    }
  }

  private createProductQrCode(): string {
    return `UPROD-${Date.now().toString(36).toUpperCase()}`;
  }
}
