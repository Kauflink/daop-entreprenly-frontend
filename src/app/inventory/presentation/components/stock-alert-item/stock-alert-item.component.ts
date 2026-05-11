import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StockAlert } from '../../../domain/model/stock-alert.entity';

@Component({
  selector: 'app-stock-alert-item',
  standalone: true,
  imports: [NgClass, MatIconModule],
  templateUrl: './stock-alert-item.component.html',
  styleUrl: './stock-alert-item.component.css'
})
export class StockAlertItemComponent {
  @Input({ required: true }) alert!: StockAlert;

  get severityClass(): string {
    if (this.alert.isOutOfStock)   return 'critical';
    if (this.alert.isLowStock)     return 'low';
    return 'warning'; // expiringSoon / expired
  }

  get icon(): string {
    if (this.alert.isOutOfStock)  return 'error';
    if (this.alert.isLowStock)    return 'warning';
    if (this.alert.isExpired)     return 'dangerous';
    if (this.alert.isExpiringSoon) return 'schedule';
    return 'notifications';
  }
}
