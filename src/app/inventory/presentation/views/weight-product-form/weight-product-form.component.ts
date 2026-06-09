import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { WeightProduct } from '../../../domain/model/weight-product.entity';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { buildQrCodeDataUrl } from '../../../infrastructure/qr-code-generator';
import { QrScannerComponent } from '../../components/qr-scanner/qr-scanner.component';

@Component({
  selector: 'app-weight-product-form',
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, ReactiveFormsModule, TranslatePipe, QrScannerComponent],
  templateUrl: './weight-product-form.component.html',
  styleUrl: './weight-product-form.component.css'
})
export class WeightProductFormComponent {
  private fb    = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(InventoryStoreService);
  protected readonly currency = inject(CurrencyService);

  form = this.fb.group({
    name:        new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    codeQR:      new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    pricePerKg:  new FormControl<number>(0,  { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] })
  });

  isEdit = false;
  submitted = false;
  weightProductId: number | null = null;
  private readonly weightProductIdSignal = signal<number | null>(null);
  private hydratedProductId: number | null = null;

  constructor() {
    this.route.params.subscribe(params => {
      this.weightProductId = params['id'] ? +params['id'] : null;
      this.weightProductIdSignal.set(this.weightProductId);
      this.isEdit = !!this.weightProductId;
      this.hydratedProductId = null;
      if (!this.isEdit) {
        this.ensureQrCode();
      }
    });

    effect(() => {
      const id = this.weightProductIdSignal();
      if (!id || this.hydratedProductId === id) return;

      const weightProduct = this.store.weightProducts().find(p => p.id === id);
      if (weightProduct) {
        this.form.patchValue({
          name:        weightProduct.name,
          description: weightProduct.description,
          codeQR:      weightProduct.codeQR,
          pricePerKg:  weightProduct.pricePerKg
        });
        this.hydratedProductId = id;
      }
    });
  }

  submit() {
    this.submitted = true;
    this.form.markAllAsTouched();
    this.ensureQrCode();
    if (this.form.invalid) return;

    const weightProduct: WeightProduct = new WeightProduct({
      _id:          this.weightProductId ?? Date.now(),
      _name:        this.form.value.name!,
      _description: this.form.value.description!,
      _codeQR:      this.form.value.codeQR!,
      _pricePerKg:  this.form.value.pricePerKg!
    });

    if (this.isEdit) {
      this.store.updateWeightProduct(weightProduct);
    } else {
      this.store.addWeightProduct(weightProduct);
    }

    this.goBack();
  }

  goBack(): void {
    const path = this.router.url.startsWith('/dashboard/inventory/weight-products')
      ? ['/dashboard/inventory/weight-products']
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
    return `WPROD-${Date.now().toString(36).toUpperCase()}`;
  }
}
