import { Component, inject } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-weight-product-list',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, ReactiveFormsModule, MatTableModule, MatButtonModule, TranslatePipe, RouterOutlet],
  templateUrl: './weight-product-list.component.html',
  styleUrl: './weight-product-list.component.css'
})
export class WeightProductListComponent {
  readonly store  = inject(InventoryStoreService);
  readonly router = inject(Router);

  displayedColumns: string[] = ['id', 'name', 'description', 'codeQR', 'pricePerKg', 'actions'];

  editWeightProduct(id: number) {
    this.router.navigate(['/dashboard/inventory/weight-products/edit', id]).then();
  }

  deleteWeightProduct(id: number) {
    this.store.deleteWeightProduct(id);
  }
}
