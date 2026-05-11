import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitProduct } from '../../../domain/model/unit-product.entity';
import { WeightProduct } from '../../../domain/model/weight-product.entity';
import {TranslatePipe} from '@ngx-translate/core';
import { buildQrCodeDataUrl } from '../../../infrastructure/qr-code-generator';

export interface ProductRow {
  id:          number;
  type:        'unit' | 'weight';
  name:        string;
  description: string;
  codeQR:      string;
  stock:       number;
  price:       string;
  raw:         UnitProduct | WeightProduct;
}

@Component({
  selector: 'app-product-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.css'
})
export class ProductItemComponent {
  @Input({ required: true }) product!: ProductRow;
  @Output() edit   = new EventEmitter<ProductRow>();

  get qrImageUrl(): string {
    return buildQrCodeDataUrl(this.product.codeQR, 54);
  }
}
