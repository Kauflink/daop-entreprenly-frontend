import { Pipe, PipeTransform, inject } from '@angular/core';
import { CurrencyService } from '../../infrastructure/currency-service';

@Pipe({
  name: 'currencyFormat',
  pure: false,
})
export class CurrencyFormatPipe implements PipeTransform {
  private readonly currencyAssembler = inject(CurrencyService);

  transform(priceInPEN: number): string {
    return this.currencyAssembler.format(priceInPEN);
  }
}
