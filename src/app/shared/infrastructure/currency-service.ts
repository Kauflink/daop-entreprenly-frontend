import { Injectable, WritableSignal, computed, signal } from '@angular/core';

export type Currency = 'PEN' | 'USD';

const PEN_TO_USD_RATE = 1 / 3.75;
const STORAGE_KEY = 'entreprenly-currency';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PEN: 'S/',
  USD: '$',
};

const CURRENCY_RATES: Record<Currency, number> = {
  PEN: 1,
  USD: PEN_TO_USD_RATE,
};

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly currencySignal: WritableSignal<Currency> = signal(this.loadCurrency());

  readonly currency = computed(() => this.currencySignal());
  readonly symbol = computed(() => CURRENCY_SYMBOLS[this.currencySignal()]);

  setCurrency(currency: Currency): void {
    this.currencySignal.set(currency);
    this.saveCurrency(currency);
  }

  format(priceInPEN: number): string {
    const currency = this.currencySignal();
    return `${CURRENCY_SYMBOLS[currency]} ${(priceInPEN * CURRENCY_RATES[currency]).toFixed(2)}`;
  }

  private loadCurrency(): Currency {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isSupportedCurrency(stored)) {
        return stored;
      }
    } catch {}

    return 'PEN';
  }

  private saveCurrency(currency: Currency): void {
    try {
      localStorage.setItem(STORAGE_KEY, currency);
    } catch {}
  }
}

export function isSupportedCurrency(value: string | null): value is Currency {
  return value === 'PEN' || value === 'USD';
}
