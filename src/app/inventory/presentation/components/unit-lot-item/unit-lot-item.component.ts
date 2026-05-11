import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {UnitLot} from '../../../domain/model/unit-lot.entity';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-unit-lot-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterOutlet],
  templateUrl: './unit-lot-item.component.html',
  styleUrl: './unit-lot-item.component.css'
})
export class UnitLotItemComponent {
  @Input({ required: true }) lot!: UnitLot;
  @Output() onEdit = new EventEmitter<number>();
  @Output() onDelete = new EventEmitter<number>();

  isExpired(date: Date): boolean {
    return new Date(date) < new Date();
  }
}
