import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WeightLot} from '../../../domain/model/weight-lot.entity';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-weight-lot-item',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './weight-lot-item.component.html',
  styleUrl: './weight-lot-item.component.css'
})
export class WeightLotItemComponent {
  @Input({ required: true }) lot!: WeightLot;
  @Output() onEdit = new EventEmitter<number>();
  @Output() onDelete = new EventEmitter<number>();
}
