import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyStore } from '../../application/currency.store';

@Pipe({
  name: 'currencyFormat',
  pure: false,
})
export class CurrencyFormatPipe implements PipeTransform {
  private readonly currencyStore = inject(CurrencyStore);

  transform(priceInPEN: number): string {
    return this.currencyStore.format(priceInPEN);
  }
}
