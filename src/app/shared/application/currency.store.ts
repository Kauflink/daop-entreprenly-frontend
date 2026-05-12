import { Injectable, WritableSignal, computed, signal } from '@angular/core';

export type Currency = 'PEN' | 'USD';

const USD_PER_PEN = 1 / 3.75;
const STORAGE_KEY = 'entreprenly-currency';

@Injectable({ providedIn: 'root' })
export class CurrencyStore {
  private readonly currencySignal: WritableSignal<Currency> = signal(this.loadFromStorage());

  readonly currency = computed(() => this.currencySignal());
  readonly symbol = computed(() => (this.currencySignal() === 'USD' ? '$' : 'S/'));

  setCurrency(currency: Currency): void {
    this.currencySignal.set(currency);
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {}
  }

  format(priceInPEN: number): string {
    if (this.currencySignal() === 'USD') {
      return `$ ${(priceInPEN * USD_PER_PEN).toFixed(2)}`;
    }
    return `S/ ${priceInPEN.toFixed(2)}`;
  }

  private loadFromStorage(): Currency {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'USD' || stored === 'PEN') return stored;
    } catch {}
    return 'PEN';
  }
}
