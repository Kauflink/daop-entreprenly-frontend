import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { resolveCardBrand } from '../../../domain/model/billing-setup.entity';

@Component({
  selector: 'app-card-brand-badge',
  templateUrl: './card-brand-badge.html',
  styleUrl: './card-brand-badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBrandBadge {
  readonly brand = input.required<string>();

  protected readonly brandInfo = computed(() => resolveCardBrand(this.brand()));

  protected readonly isVisa = computed(() => this.brandInfo().id === 'visa');
  protected readonly isMastercard = computed(() => this.brandInfo().id === 'mastercard');
  protected readonly isAmericanExpress = computed(() => this.brandInfo().id === 'american-express');
  protected readonly isDinersClub = computed(() => this.brandInfo().id === 'diners-club');
  protected readonly isDiscover = computed(() => this.brandInfo().id === 'discover');
  protected readonly isJcb = computed(() => this.brandInfo().id === 'jcb');
  protected readonly isUnionPay = computed(() => this.brandInfo().id === 'unionpay');
}
