import { ConversionRate, Currency } from '@/types';

const STORAGE_KEYS = {
  CURRENCIES: 'arbitrage_currencies',
  RATES: 'arbitrage_rates',
} as const;

export const storage = {
  saveCurrencies: (currencies: Currency[]) => {
    localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies));
  },

  loadCurrencies: (): Currency[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENCIES);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((currency: Currency) => ({
        ...currency,
        createdAt: new Date(currency.createdAt),
      }));
    } catch {
      return [];
    }
  },

  saveRates: (rates: ConversionRate[]) => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  },

  loadRates: (): ConversionRate[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.RATES);
    if (!stored) return [];
    
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((rate: ConversionRate) => ({
        ...rate,
        lastUpdated: new Date(rate.lastUpdated),
      }));
    } catch {
      return [];
    }
  },
};
