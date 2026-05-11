import { Component, inject } from '@angular/core';
import { InventoryStoreService } from '../../../application/inventory-store.service';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef,
  MatHeaderCell, MatCell, MatHeaderRow, MatRow,
  MatHeaderRowDef, MatRowDef } from '@angular/material/table';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-unit-product-list',
  imports: [MatTable, MatColumnDef, MatHeaderCellDef, MatCellDef, MatHeaderCell,
    MatCell, MatHeaderRowDef, MatRowDef, MatHeaderRow, MatRow,RouterOutlet,
    MatButton, MatProgressSpinner],
  templateUrl: './unit-product-list.component.html',
  styleUrl: './unit-product-list.component.css'
})
export class UnitProductListComponent {
  readonly store   = inject(InventoryStoreService);
  readonly router  = inject(Router);

  displayedColumns: string[] = ['id', 'name', 'description', 'codeQR', 'price', 'weightGrams', 'brand', 'actions'];

  editUnitProduct(id: number) {
    this.router.navigate(['/dashboard/inventory/unit-products/edit', id]).then();
  }

  deleteUnitProduct(id: number) {
    this.store.deleteUnitProduct(id);
  }
}
