import { Component, inject, computed, signal } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

import { CurrencyService } from '../../../../shared/infrastructure/currency-service';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { UnitProduct } from '../../../domain/model/unit-product.entity';
import { WeightProduct } from '../../../domain/model/weight-product.entity';
import { ProductItemComponent, ProductRow } from '../../components/product-item/product-item.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    TranslatePipe,
    ProductItemComponent,
    RouterOutlet
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  readonly store = inject(InventoryStoreService);
  readonly router = inject(Router);
  readonly route  = inject(ActivatedRoute);
  private readonly currency = inject(CurrencyService);

  searchTerm = signal('');

  private readonly allProducts = computed<ProductRow[]>(() => {
    const units: ProductRow[] = this.store.unitProducts().map((p: UnitProduct) => ({
      id: p.id,
      type: 'unit' as const,
      typeKey: 'products.form.byUnit',
      name: p.name,
      description: p.description,
      codeQR: p.codeQR,
      stock: this.store.unitLots()
        .filter(l => l.productId === p.id)
        .reduce((acc, l) => acc + l.quantity, 0),
      price: this.currency.format(p.price),
      raw: p
    }));

    const weights: ProductRow[] = this.store.weightProducts().map((p: WeightProduct) => ({
      id: p.id,
      type: 'weight' as const,
      typeKey: 'products.form.byWeight',
      name: p.name,
      description: p.description,
      codeQR: p.codeQR,
      stock: this.store.weightLots()
        .filter(l => l.productId === p.id)
        .reduce((acc, l) => acc + l.quantityKg, 0),
      price: `${this.currency.format(p.pricePerKg)}/Kg`,
      raw: p
    }));

    return [...units, ...weights];
  });

  readonly products = computed<ProductRow[]>(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.allProducts();
    }

    return this.allProducts().filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    );
  });

  goToAdd(): void {
    this.router.navigate(['/dashboard/inventory/products/new']);
  }

  onEdit(row: ProductRow): void {
    const path = row.type === 'unit'
      ? ['/dashboard/inventory/products/edit', row.id]
      : ['/dashboard/inventory/products/weight-edit', row.id];

    this.router.navigate(path);
  }

  onDelete(row: ProductRow): void {
    if (row.type === 'unit') {
      this.store.deleteUnitProduct(row.id);
    } else {
      this.store.deleteWeightProduct(row.id);
    }
  }
}
