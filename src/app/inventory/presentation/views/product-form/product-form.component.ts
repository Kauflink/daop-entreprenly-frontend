import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { UnitProduct }   from '../../../domain/model/unit-product.entity';
import { WeightProduct } from '../../../domain/model/weight-product.entity';
import { buildQrCodeDataUrl } from '../../../infrastructure/qr-code-generator';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, QrScannerComponent],
  templateUrl: './product-form.component.html',
  styleUrl:    './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  private readonly store  = inject(InventoryStoreService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);
  private readonly fb     = inject(FormBuilder);
  protected readonly currency = inject(CurrencyService);

  /* ── state ─────────────────────────────────────────────── */
  productType = signal<'unit' | 'weight'>('unit');
  isUnit      = computed(() => this.productType() === 'unit');
  qrCode      = signal<string>(this.newCode());
  editId      = signal<number | null>(null);
  submitted   = false;

  form: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    description: [''],
    // unit
    price:       [1.00, [Validators.required, Validators.min(0)]],
    weightGrams: [0.00, Validators.min(0)],
    brand:       [''],
    // weight
    pricePerKg:  [1.00, [Validators.required, Validators.min(0)]],
  });

  /* ── QR helpers ─────────────────────────────────────────── */
  get qrImageUrl(): string {
    return buildQrCodeDataUrl(this.qrCode(), 130);
  }

  private newCode(): string {
    return Math.random().toString(36).substring(2, 14).toUpperCase();
  }

  onQrScanned(value: string): void {
    this.qrCode.set(value);
  }

  /* ── lifecycle ──────────────────────────────────────────── */
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const isWeight = this.router.url.includes('weight-edit');

    if (!id) return; // new product — nothing to preload

    this.editId.set(id);

    if (isWeight) {
      this.productType.set('weight');
      const p = this.store.weightProducts().find(x => x.id === id);
      if (p) {
        this.qrCode.set(p.codeQR);
        this.form.patchValue({ name: p.name, description: p.description, pricePerKg: p.pricePerKg });
      }
    } else {
      this.productType.set('unit');
      const p = this.store.unitProducts().find(x => x.id === id);
      if (p) {
        this.qrCode.set(p.codeQR);
        this.form.patchValue({ name: p.name, description: p.description, price: p.price, weightGrams: p.weightGrams, brand: p.brand });
      }
    }
  }

  /* ── actions ────────────────────────────────────────────── */
  setType(t: 'unit' | 'weight'): void { this.productType.set(t); }

  close(): void {
    this.router.navigate(['/dashboard/inventory/products']);
  }

  save(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v  = this.form.value;
    const id = this.editId() ?? Date.now();

    if (this.isUnit()) {
      const product = new UnitProduct({
        _id: id, _name: v.name, _description: v.description,
        _codeQR: this.qrCode(), _price: v.price,
        _weightGrams: v.weightGrams, _brand: v.brand
      });
      this.editId()
        ? this.store.updateUnitProduct(product)
        : this.store.addUnitProduct(product);
    } else {
      const product = new WeightProduct({
        _id: id, _name: v.name, _description: v.description,
        _codeQR: this.qrCode(), _pricePerKg: v.pricePerKg
      });
      this.editId()
        ? this.store.updateWeightProduct(product)
        : this.store.addWeightProduct(product);
    }

    this.close();
  }
}
